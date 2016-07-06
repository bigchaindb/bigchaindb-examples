"""This module contains basic functions to instantiate the BigchainDB API.

The application is implemented in Flask and runs using Gunicorn.
"""
import os

from flask import Flask
from flask.ext.cors import CORS

from server.lib.api.views import api_views


def create_app(debug):
    """Return an instance of the Flask application.

    Args:
        debug (bool): a flag to activate the debug mode for the app
            (default: False).
    """

    app = Flask(__name__)
    hostname = os.environ.get('DOCKER_MACHINE_IP', 'localhost')
    if not hostname:
        hostname = 'localhost'
    origins = ('^(https?://)?(www\.)?({}|0|0.0.0.0|dimi-bat.local|'
               'localhost|127.0.0.1)(\.com)?:\d{{1,5}}$').format(hostname),
    CORS(app,
         origins=origins,
         headers=(
            'x-requested-with',
            'content-type',
            'accept',
            'origin',
            'authorization',
            'x-csrftoken',
            'withcredentials',
            'cache-control',
            'cookie',
            'session-id',
            ),
         supports_credentials=True,
         )

    app.debug = debug

    app.register_blueprint(api_views, url_prefix='/api')
    return app


def run_flask_server():
    app = create_app(debug=True)
    app.run(host=os.environ.get('FLASK_HOST', '127.0.0.1'), port=int(os.environ.get('FLASK_PORT', 8000)))
    app.run(use_reloader=False)

if __name__ == '__main__':
    run_flask_server()
