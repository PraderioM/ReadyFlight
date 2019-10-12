from aiohttp import web
from typing import List
import json

from backend.game.models import EndGame, GameResponse


async def update_game(request):
    body = await request.json()

    position: str = body['position']
    plays_to_send: List[str] = body['plays_to_send']
    plays_suffered: List[str] = body['plays_suffered']
    token: str = body['token']

    # Todo pillar game id desde bade de dades, obtindre JOC desde active games.
    # fer les poeracions de la llibreta.

    return web.Response(status=200, body=json.dumps(game_response.to_json()))
