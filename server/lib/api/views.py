"""This module provides the blueprint for some basic API endpoints.

For more information please refer to the documentation in Apiary:
 - http://docs.bigchaindb.apiary.io/
"""
import json
import os

import flask
from flask import request, Blueprint

from init_accounts import get_bigchain

from server.lib.models import accounts
from server.lib.models import assets

api_views = Blueprint('api_views', __name__)

bigchain = get_bigchain()


@api_views.route('/accounts/')
def get_accounts():
    app = '{}'.format(request.args.get('app'))
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
    return flask.jsonify({'assets': result, 'account': account_vk})


@api_views.route('/connectors/')
def get_connectors_for_account():
    app = '{}'.format(request.args.get('app'))
    # result = accounts.get_connectors(bigchain, ledger_id, app)
    # return json.dumps(result)
    return json.dumps(["http://localhost:4002", "http://localhost:4001"])


@api_views.route('/assets/')
def get_assets():
    search = request.args.get('search')
    result = assets.get_assets(bigchain, search)
    return flask.jsonify({'assets': result})


@api_views.route('/assets/<txid>/')
def get_asset(txid):
    result = assets.get_asset(bigchain, txid)
    return flask.jsonify(result[0])


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


@api_views.route('/assets/<asset_id>/<cid>/escrow/', methods=['POST'])
def escrow_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    expires_at = json_payload.pop('expiresAt')
    ilp_header = json_payload.pop('ilpHeader', None)
    execution_condition = json_payload.pop('executionCondition')
    to = json_payload.pop('to')

    tx = assets.escrow_asset(bigchain=bigchain,
                             source=source['vk'],
                             to=to['vk'],
                             asset_id={
                                 'txid': asset_id,
                                 'cid': int(cid)
                             },
                             sk=source['sk'],
                             expires_at=expires_at,
                             ilp_header=ilp_header,
                             execution_condition=execution_condition)

    return flask.jsonify(**tx)


@api_views.route('/assets/<asset_id>/<cid>/escrow/fulfill/', methods=['POST'])
def fulfill_escrow_asset(asset_id, cid):
    json_payload = request.get_json(force=True)
    source = json_payload.pop('source')
    to = json_payload.pop('to')

    execution_fulfillment = json_payload.pop('conditionFulfillment', None)

    tx = assets.fulfill_escrow_asset(bigchain=bigchain,
                                     source=source['vk'],
                                     to=to['vk'],
                                     asset_id={
                                         'txid': asset_id,
                                         'cid': int(cid)
                                     },
                                     sk=source['sk'],
                                     execution_fulfillment=execution_fulfillment)

    return flask.jsonify(**tx)
