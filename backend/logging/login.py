import random
from aiohttp import web
import json

import asyncpg


async def login(request):
    """Returns state 200 and the generated token if the user and password are correct, returns state 401 otherwise"""
    body = await request.json()

    db: asyncpg.Connection = request.app['db']
    async with db.transaction():
        user_password = await db.fetchrow("""
                                 SELECT password AS password
                                 FROM  users
                                 WHERE name=$1
                                 """, body['name'])

        # If we the combination user password doesn't exist return None.
        if user_password is None:
            return web.Response(status=401,
                                body=json.dumps(
                                    {
                                        'token': None,
                                        'exitStatus': 'User Name not found'
                                    }
                                )
                                )
        elif user_password['password'] != body['password']:
            return web.Response(status=401,
                                body=json.dumps(
                                    {
                                        'token': None,
                                        'exitStatus': 'Incorrect Password'
                                    }
                                )
                                )
        # Generate token.
        rand_gen = random.SystemRandom()
        token = ''.join(rand_gen.choice('0123456789abcdef') for _ in range(64))

        # Update the token in the database.
        await db.execute("""
                         UPDATE users
                         SET token=$1
                         WHERE name=$2
                         """, token, body['name'])

        return web.Response(status=200, body=json.dumps({'token': token}))
