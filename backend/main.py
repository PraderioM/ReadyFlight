import asyncio
import os

from aiohttp import web
import aiohttp_cors
import asyncpg

from backend.logging.login import login
from backend.logging.logout import logout
from backend.logging.register import register
from backend.logging.change_language import change_language
from backend.game.update_game import update_game
from backend.game.start_game import start_game
from backend.scores.get_score import get_scores
from backend.scores.update_max_score import update_max_score


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
    print('creating web app.')
    conn = await asyncpg.create_pool(
        database=os.environ.get('DATABASE_NAME', 'ready-flight'),
        host=os.environ.get('DATABASE_HOST', '0.0.0.0'),
        port=os.environ.get('DATABASE_PORT', 1000),
        user=os.environ.get('DATABASE_USER', 'admin'),
        password=os.environ.get('DATABASE_PASSWORD', 'admin'),
        min_size=1,
        max_size=10
    )
    app_["db"] = conn

    # Register handlers.
    app_.router.add_get('/login', login)
    app_.router.add_get('/logout', logout)
    app_.router.add_get('/register', register)
    app_.router.add_get('/change_language', change_language)

    app_.router.add_post('/update_game', update_game)
    app_.router.add_get('/start_game', start_game)

    app_.router.add_get('/get_scores', get_scores)
    app_.router.add_get('/update_max_score', update_max_score)

    # Configure CORS on all routes (deactivate it).
    for route in list(app_.router.routes()):
        cors.add(route)

    return app_


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    app = loop.run_until_complete(create_app())
    web.run_app(app, host="0.0.0.0", port=2121)
