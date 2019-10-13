from aiohttp import web


async def update_max_score(request):
    token = request.rel_url.query['token']
    score = request.rel_url.query['score']
    if score == '':
        score = 0
    else:
        score = float(score)

    async with request.app['db'].acquire() as db:
        existing_score = await db.fetchval("""
                                          SELECT single_player_score
                                          FROM users
                                          WHERE token = $1
                                          """, token)
        if existing_score is not None:
            score = max(score, existing_score)

            await db.execute("""
                             UPDATE users
                             SET single_player_score = $1
                             WHERE token = $2
                             """, score, token)

    return web.Response(status=200)
