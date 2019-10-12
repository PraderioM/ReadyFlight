from aiohttp import web
import json

from backend.scores.models import Score


async def get_scores(request):
    token = request.rel_url.query['token']
    # Todo sort scores and return sorted score list.

    return web.Response(status=200, body=json.dumps([score.to_json() for score in sorted_scores]))
