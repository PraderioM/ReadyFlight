from aiohttp import web


async def start_game(request):
    token = request.rel_url.query['token']
    # Todo do shit with multiple queues to obtain desired game.

    return web.Response(status=200)
