from aiohttp import web
from typing import List
import json
import asyncpg
from datetime import datetime

from backend.game.models import EndGame, GameResponse, Game, Player
from backend.global_variables import ACTIVE_GAMES


async def update_game(request):
    body = await request.json()

    position: float = body['position']
    plays_to_send: List[str] = body['plays_to_send']
    plays_suffered: List[str] = body['plays_suffered']
    token: str = body['token']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            result = await db.fetchrow("""
                                         SELECT game AS game,
                                                name AS name,
                                                language AS language
                                         FROM  users
                                         where token=$1
                                         """, token)
            game_id = result['game']
            name = result['name']
            language = result['language']
            game: Game = ACTIVE_GAMES[str(game_id)]

            # Get current and other player.
            if game.player_1.name == name:
                curr_player: Player = game.player_1
                other_player: Player = game.player_2
            else:
                curr_player: Player = game.player_2
                other_player: Player = game.player_1

            # Update last update.
            now = datetime.now()
            curr_player.position = position
            curr_player.last_update_time = now
            for play in plays_to_send:
                await curr_player.plays_to_send.put(play)

            new_plays_suffered: List[str] = []
            for play in plays_suffered:
                if play == 'Bomb':
                    if language == 'English':
                        msg = 'Your opponent has been attacked by the police for carrying an slightly big bottle of perfume.'
                    elif language == 'Spanish':
                        msg = 'Tu oponente ha sido atacado por la policia por llevar una botella de perfume ligeramente grande.'
                    elif language == 'Catalan':
                        msg = 'El teu oponent ha sigut atacat per portar una ampolla de perfum lleugerament gran'
                    else:
                        continue
                    new_plays_suffered.append(msg)
                elif play == 'Suitcase':
                    if language == 'English':
                        msg = 'Your opponent is trying to breath from between a huge pile of sweters that for some reason somebody is taking to Hawaii.'
                    elif language == 'Spanish':
                        msg = 'Tu oponente està intentando respirar entre una enorme pila de sueters que por algún motivo alguien se está llevando a Hawaii.'
                    elif language == 'Catalan':
                        msg = 'El teu oponent està intentant respirar entre una gran pila de sweters que per algún motiu algú es vol emportar a Hawaii.'
                    else:
                        continue
                    new_plays_suffered.append(msg)
                else:
                    continue

            for play in new_plays_suffered:
                await curr_player.plays_suffered.put(play)

            if curr_player.position >= 1:
                end_game = EndGame(end=True, won=True, error=False, message='Initializing victory dance.')
                await remove_game_from_database(db=db, game_id=game_id, name=name, win=True)
            elif other_player.position >= 1:
                end_game = EndGame(end=True, won=False, error=False,
                                   message='Initializing loser dance. Put your finger and your thumb in '
                                           'your head in the shape of an L.')
                await remove_game_from_database(db=db, game_id=game_id, name=name, win=False)
            elif (now - other_player.last_update_time).total_seconds() > 10:
                end_game = EndGame(end=True, won=True, error=True,
                                   message='Your mighty power has made your opponent run afraid from you.')
                await remove_game_from_database(db=db, game_id=game_id, name=name, win=True, update_score=False)
            else:
                end_game = EndGame(end=False, won=False, error=False,
                                   message='Fight to the death.')

            # Empty queues.
            new_plays_to_receive: List[str] = []
            while not other_player.plays_to_send.empty():
                play = await other_player.plays_to_send.get()
                new_plays_to_receive.append(play)

            new_plays_afflicted: List[str] = []
            while not other_player.plays_suffered.empty():
                play = await other_player.plays_suffered.get()
                new_plays_afflicted.append(play)

            game_response = GameResponse(position=other_player.position,
                                         new_plays_to_receive=new_plays_to_receive,
                                         new_plays_afflicted=new_plays_afflicted, end_game=end_game)

    return web.Response(status=200, body=json.dumps(game_response.to_json()))


async def remove_game_from_database(db: asyncpg.Connection, game_id: str, name: str, win: bool,
                                    update_score: bool = True):
    # Update scores of winner and looser if asked.
    if update_score:
        score_list = await db.fetch("""
                                    SELECT score AS score,
                                           name AS name
                                    FROM users
                                    WHERE game = $1
                                    """, game_id)

        # If there is no result we must do nothing since there is nothing to update.
        if score_list is None:
            return
        
        # Otherwise we compute the score difference and update the results.
        max_dict = max(score_list, key=lambda d: d['score'])
        min_dict = min(score_list, key=lambda d: d['score'])
        max_name = max_dict['name']
        min_name = min_dict['name']
        
        if min_name == name and win or min_name != name and not win:
            await db.execute("""
                             UPDATE users
                             SET score = score + $1
                             WHERE name = $2
                             """, 1, min_name)
            await db.execute("""
                             UPDATE users
                             SET score = max(0, score - $1)
                             WHERE name = $2
                             """, 0.5, max_name)
        else:
            await db.execute("""
                             UPDATE users
                             SET score = max(0, score - $1)
                             WHERE name = $2
                             """, 1, min_name)
            await db.execute("""
                             UPDATE users
                             SET score = score + $1
                             WHERE name = $2
                             """, 1, max_name)

    # Remove game from database.
    await db.execute("""
                    UPDATE users
                    SET game = NULL
                    WHERE game = $1
                    """, game_id)

