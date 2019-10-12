from aiohttp import web
from uuid import uuid4
import datetime
import asyncpg

from backend.global_variables import queue1, queue2, ACTIVE_GAMES
from game.models import Game


async def start_game(request):
    token = request.rel_url.query['token']
    # Todo do shit with multiple queues to obtain desired game.

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            this_player = await db.fetchrow("""
                                         SELECT name AS name
                                         FROM  users
                                         WHERE token=$1
                                         """, token)

    if queue1.empty() is True:
        game_id = uuid4()

        queue1.put_nowait(game_id)

        ACTIVE_GAMES[game_id] = Game(None, None, None)
        game_id = await queue2.get()
        game = ACTIVE_GAMES[game_id]
        game._player_2 = this_player
    else:
        game_id = await queue1.get()
        await queue2.put(game_id)

        game = ACTIVE_GAMES[game_id]
        game._game_start_time = datetime.now()
        game._player_1 = this_player

    await db.execute("""
                        UPDATE users
                        SET game=$1
                        WHERE token=$2
                        """, game_id, token)

    return web.Response(status=200)
