"""This module provides the blueprint for some basic API endpoints.

For more information please refer to the documentation in Apiary:
 - http://docs.bigchaindb.apiary.io/
"""

import bigchaindb
import flask
from flask import request, Blueprint, render_template

from server.lib.models import accounts
from server.lib.models import assets

app_name = __name__.split('.')[0]
bigchain = bigchaindb.Bigchain()

basic_views = Blueprint('basic_views', __name__)
api_views = Blueprint('api_views', __name__)


@basic_views.route('/ontherecord/')
def on_the_record():
    return render_template('on_the_record.html')


@basic_views.route('/sharetrade/')
def share_trade():
    return render_template('share_trade.html')


@api_views.route('/accounts/')
def get_accounts():
    app = request.args.get('app')
    result = accounts.retrieve_accounts(bigchain, app)
    return flask.jsonify({'accounts': result})


@api_views.route('/accounts/', methods=['POST'])
def post_account():
    json_payload = request.get_json(force=True)
    tx = assets.create_asset(bigchain=bigchain,
                             to=json_payload['to'],
                             payload={'content': json_payload['content']})
    return flask.jsonify(**tx)


@api_views.route('/accounts/<account_vk>/assets/')
def get_assets_for_account(account_vk):
    query = request.args.get('search')

    result = {
        'bigchain': assets.get_owned_assets(bigchain, vk=account_vk, query=query),
        'backlog': assets.get_owned_assets(bigchain, vk=account_vk, query=query, table='backlog')
    }
    return flask.jsonify({'assets': result})


@api_views.route('/assets/')
def get_assets():
    search = request.args.get('search')
    result = assets.get_assets(bigchain, search)
    return flask.jsonify({'assets': result})


@api_views.route('/assets/', methods=['POST'])
def post_asset():
    json_payload = request.get_json(force=True)
    to = json_payload.pop('to')
    tx = assets.create_asset(bigchain=bigchain,
                             to=to,
                             payload=json_payload)

    return flask.jsonify(**tx)


@api_views.route('/assets/<asset_id>/<cid>/transfer/', methods=['POST'])
def transfer_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    to = json_payload.pop('to')

    tx = assets.transfer_asset(bigchain=bigchain,
                               source=source['vk'],
                               to=to['vk'],
                               asset_id={
                                   'txid': asset_id,
                                   'cid': int(cid)
                               },
                               sk=source['sk'])

    return flask.jsonify(**tx)
