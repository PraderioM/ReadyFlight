from aiohttp import web


async def update_max_score(request):
    token = request.rel_url.query['token']
    score = request.rel_url.query['score']
    if score == '':
        score = 0
    else:
        score = float(score)

    async with request.app['db'].acquire() as db:
        await db.execute("""
                         UPDATE users
                         SET single_player_score = max(single_player_score, $1)
                         WHERE token = $2
                         """, score, token)

    return web.Response(status=200)
