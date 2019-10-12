import json
from uuid import uuid4

from aiohttp import web
import asyncpg


async def register(request):
    """Add User and Password"""
    name = request.rel_url.query['name']
    password = request.rel_url.query['password']
    language = request.rel_url.query['language']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            user_password = await db.fetchrow("""
                                         SELECT password AS password
                                         FROM  users
                                         WHERE name=$1
                                         """, name)

            # If the user password doesn't exist return None.
            if user_password is None:
                # Generate token.
                token = uuid4()

                # Insert the user and password  and token in the database.
                await db.execute("""INSERT INTO users (name, password, token, language)
                                    VALUES ($1, $2, $3,$4)
                                    """, name, password, token, language)

                token = str(token)
                message = 'Everything is awesome'

            else:
                token = None
                message = 'This User already exists'
                if language is 'English':
                    message = 'This User already exists'
                elif language is 'Español':
                    message = 'El usuario ya existe'
                elif language is 'Català':
                    message = 'Usuari ja existent'

            return web.Response(status=200,
                                body=json.dumps(
                                    {
                                        'token': token,
                                        'message': message
                                    }
                                )
                                )
