from aiohttp import web
from uuid import uuid4
import json

import asyncpg


async def login(request):
    """Returns state 200 and the generated token if the user and password are correct, returns state 401 otherwise"""
    name = request.rel_url.query['name']
    password = request.rel_url.query['password']

    pool = request.app['db']
    async with pool.acquire() as db:
        db: asyncpg.Connection = db
        async with db.transaction():
            user_password = await db.fetchrow("""
                                     SELECT password AS password
                                     FROM  users
                                     WHERE name=$1
                                     """, name)

            # If we the combination user password doesn't exist return None.
            if user_password is None:
                return web.Response(status=200,
                                    body=json.dumps(
                                        {
                                            'token': None,
                                            'errorMessage': 'User Name not found'
                                        }
                                    )
                                    )
            elif user_password['password'] != password:
                return web.Response(status=200,
                                    body=json.dumps(
                                        {
                                            'token': None,
                                            'errorMessage': 'Incorrect Password'
                                        }
                                    )
                                    )
            # Generate token.
            token = uuid4()

            # Update the token in the database.
            await db.execute("""
                             UPDATE users
                             SET token=$1
                             WHERE name=$2
                             """, token, name)

            return web.Response(status=200, body=json.dumps({'token': str(token),
                                                             'errorMessage': 'Everything is awesome.'}))
