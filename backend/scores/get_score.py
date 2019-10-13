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

    scores_list: List[Score] = []
    for res in res_list:
        scores_list.append(Score(name=res['name'], score=res['score'], max_time=res['single_player_score']))
    scores_list.sort(key=lambda s: s.score, reverse=True)

    return web.Response(status=200, body=json.dumps([score.to_json() for score in scores_list]))
