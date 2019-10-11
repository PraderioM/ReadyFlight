import asyncio
import os

from aiohttp import web
import aiohttp_cors
import asyncpg

from backend.logging.login import login
from backend.logging.logout import logout
from backend.logging.register import register


async def create_app():  # Start the app
    app_ = web.Application()

    # Configure default CORS settings.
    cors = aiohttp_cors.setup(app_, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    # Get a connection pool to the database.
    conn = await asyncpg.connect(
        database=os.environ.get('DATABASE_NAME', 'ready-flight'),
        host=os.environ.get('DATABASE_HOST', '10.4.190.238'),
        port=os.environ.get('DATABASE_PORT', 1000),
        user=os.environ.get('DATABASE_USER', 'admin'),
        password=os.environ.get('DATABASE_PASSWORD', 'admin'),
    )
    app_["db"] = conn

    # Register handlers.
    app_.router.add_get('/login', login)
    app_.router.add_get('/logout', logout)
    app_.router.add_get('/register', register)

    # Configure CORS on all routes (deactivate it).
    for route in list(app_.router.routes()):
        cors.add(route)

    return app_


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    app = loop.run_until_complete(create_app())
    web.run_app(app, host="0.0.0.0", port=2121)
