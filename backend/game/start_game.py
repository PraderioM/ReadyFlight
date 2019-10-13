from aiohttp import web
from uuid import uuid4
from datetime import datetime
import asyncpg

from backend.global_variables import queue1, queue2, ACTIVE_GAMES
from backend.game.models import Game, Player


async def start_game(request):
    token = request.rel_url.query['token']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            player_name = await db.fetchval("""
                                         SELECT name
                                         FROM  users
                                         WHERE token=$1
                                         """, token)

        while True:
            original_game_id = uuid4()
            if queue1.empty() is True:
                ACTIVE_GAMES[str(original_game_id)] = Game(None, None, Player(datetime.now(),
                                                                              position=0,
                                                                              name=player_name))

                game_id = original_game_id
                queue1.put_nowait(original_game_id)
                game_id = await queue2.get()

                game = ACTIVE_GAMES[str(game_id)]
                game.player_2 = Player(last_update_time=datetime.now(), position=0, name=player_name)

                # This could happen due to a sudden disconnection.
                if game.player_1.name == player_name:
                    ACTIVE_GAMES.pop(str(game_id))
                    continue
                else:
                    break
            else:
                game_id = await queue1.get()
                await queue2.put(game_id)

                game: Game = ACTIVE_GAMES[str(game_id)]
                game.game_start_time = datetime.now()
                game.player_1 = Player(last_update_time=datetime.now(), position=0, name=player_name)

                # This could happen due to a sudden disconnection.
                if game.player_2.name == player_name:
                    ACTIVE_GAMES.pop(str(game_id))
                    continue
                else:
                    break

        await db.execute("""
                            UPDATE users
                            SET game=$1
                            WHERE token=$2
                            """, game_id, token)

    return web.Response(status=200)
