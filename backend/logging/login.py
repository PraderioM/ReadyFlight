import random
from aiohttp import web
import json

import asyncpg


async def login(request):
    """Returns state 200 and the generated token if the user and password are correct, returns state 401 otherwise"""
    body = await request.json()

    db: asyncpg.Connection = request.app['db']
    async with db.transaction():
        user_data = await db.fetchrow("""
                                 SELECT name AS name
                                 FROM  users
                                 WHERE name=$1 AND password=$2
                                 """, body['user'], body['password'])

        # If we the combination user password doesn't exist return None.
        if user_data is None:
            return web.Response(status=401)

        # Generate token.
        rand_gen = random.SystemRandom()
        token = ''.join(rand_gen.choice('0123456789abcdef') for _ in range(64))

        # Update the token and the expiration date in the database.
        await db.execute("""
                         UPDATE users
                         SET token=$1
                         WHERE name=$2
                         """, token, body['user'])

        return web.Response(status=200, body=json.dumps({'token': token,
                                                         'class': user_data['class']}))
