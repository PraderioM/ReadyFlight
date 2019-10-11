import traceback

from aiohttp import web


def authenticate(original_function):
    """
    Return the original function adding a previous authentication process
    """

    async def f(request):
        token = request.headers['Authorization'][7:]

        if not token:
            return web.Response(status=401)

        async with request.app['db'].acquire() as db:
            user_token = await db.fetchrow("""
                                            SELECT name AS name
                                            FROM users
                                            WHERE token=$1
                                            """, token)

            try:
                if user_token is not None:
                    return await original_function(user_token['name'], request)
                else:
                    return web.Response(status=401)
            except Exception as ex:
                traceback.print_exc()
                raise

    return f
