from uuid import uuid4

from aiohttp import web
import asyncpg


async def change_language(request):
    """Change Language"""
    token = request.rel_url.query['token']
    language = request.rel_url.query['language']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            await db.execute("""
                              UPDATE users 
                              SET language=$1  
                              WHERE token=$2
                              """, language, token)

            return web.Response(status=200)
