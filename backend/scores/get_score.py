from typing import List
from aiohttp import web
import json

from backend.scores.models import Score


async def get_scores(request):
    async with request.app['db'].acquire() as db:
        res_list = await db.fetch("""
                                  SELECT name AS name,
                                         score AS score,
                                         single_player_score AS single_player_score
                                  from users
                                  ORDER BY score ASC
                                  """)

    sorted_scores: List[Score] = []
    for res in res_list:
        sorted_scores.append(Score(name=res['name'], score=res['score'], max_time=res['single_player_score']))

    return web.Response(status=200, body=json.dumps([score.to_json() for score in sorted_scores]))
