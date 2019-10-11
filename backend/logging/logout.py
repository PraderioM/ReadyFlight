from aiohttp import web

import asyncpg

from backend.authenticate import authenticate


@authenticate
async def logout(worker: str, request):
    """Removes the given token from the database"""
    # Set the token to null.
    db: asyncpg.Connection = request.app['db']
    async with db.transaction():
        await db.execute("""
                         UPDATE users
                         SET token=NULL
                         WHERE name=$1
                         """, worker)

        return web.Response(status=200)
