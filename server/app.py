"""This module contains basic functions to instantiate the BigchainDB API.

The application is implemented in Flask and runs using Gunicorn.
"""
from flask import Flask

from server.lib.api import views


def create_app(debug):
    """Return an instance of the Flask application.

    Args:
        debug (bool): a flag to activate the debug mode for the app
            (default: False).
    """

    app = Flask(__name__)

    app.debug = debug

    app.register_blueprint(views.basic_views)
    app.register_blueprint(views.api_views, url_prefix='/api')
    return app


if __name__ == '__main__':
    app = create_app(debug=True)
    app.run(port=8000)
    app.run()
