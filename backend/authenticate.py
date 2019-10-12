import traceback

from aiohttp import web


def authenticate(original_function):
    """
    Return the original function adding a previous authentication process
    """

    async def f(request):
        body = await request.json()

        if 'token' not in body.keys():
            return web.Response(status=401)

        async with request.app['db'].acquire() as db:
            user_token = await db.fetchrow("""
                                            SELECT name AS name
                                            FROM users
                                            WHERE token=$1
                                            """, body['token'])

            try:
                if user_token is not None:
                    return await original_function(user_token['name'], request)
                else:
                    return web.Response(status=401)
            except Exception as ex:
                traceback.print_exc()
                raise

    return f
