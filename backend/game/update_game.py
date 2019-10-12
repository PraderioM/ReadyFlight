from aiohttp import web
from typing import List
import json
import asyncpg
from uuid import uuid4

from backend.game.models import EndGame, GameResponse, Game, Player
from backend.global_variables import ACTIVE_GAMES


async def update_game(request):
    body = await request.json()

    position: str = body['position']
    plays_to_send: List[str] = body['plays_to_send']
    plays_suffered: List[str] = body['plays_suffered']
    token: str = body['token']

    # Todo pillar game id desde bade de dades, obtindre JOC desde active games.
    # fer les poeracions de la llibreta.

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            game_id = await db.fetchrow("""
                                         SELECT game AS game
                                         FROM  users
                                         where token=$2
                                         """, token)
            ACTIVE_GAMES[game_id] = GameResponse(position, new_plays_to_receive=plays_to_send,
                                                 new_plays_afflicted=plays_suffered)

    return web.Response(status=200, body=json.dumps(ACTIVE_GAMES[game_id].to_json()))
