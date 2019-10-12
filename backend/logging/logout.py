from aiohttp import web

import asyncpg


async def logout(request):
    """Removes the given token from the database"""
    # Set the token to null.
    token = request.rel_url.query['token']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            await db.execute("""
                             UPDATE users
                             SET token=NULL
                             WHERE token=$1
                             """, token)

            return web.Response(status=200)
