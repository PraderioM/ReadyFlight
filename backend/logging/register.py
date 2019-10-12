import json
from aiohttp import web
import asyncpg
import random


async def register(request):
    """Add User and Password"""
    body = await request.json()

    db: asyncpg.Connection = request.app['db']
    async with db.transaction():
        user_password = await db.fetchrow("""
                                     SELECT password AS password
                                     FROM  users
                                     WHERE name=$1
                                     """, body['name'])

        # If the user password doesn't exist return None.
        if user_password is None:
            # Generate token.
            rand_gen = random.SystemRandom()
            token = ''.join(rand_gen.choice('0123456789abcdef') for _ in range(64))

            # Insert the user and password  and token in the database.
            await db.execute("""INSERT INTO users (name, password, token, language)
                                VALUES ($1, $2,$,$4)
                                """, body['name'], body['password'],token, body['language'])

            return web.Response(status=200, body=json.dumps({'token': token}))

        else:
            if body['language'] is 'English':
                message = 'This User already exists'
            elif body['language'] is 'Español':
                 message = 'El usuario ya existe'
            elif body['language'] is 'Català':
                 message = 'Usuari ja existent'
            return web.Response(status=401,
                                body=json.dumps(
                                    {
                                        'token': None,
                                        'exitStatus': message
                                    }
                                )
                                )