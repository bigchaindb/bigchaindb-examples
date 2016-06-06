import co from 'co/';

import reconnectCore from 'reconnect-core/';
import EventEmitter2 from 'eventemitter2/';
import SimpleWebsocket from 'simple-websocket/';

class BigchainDBLedger extends EventEmitter2 {

    constructor(options) {
        super();

        this.id = null;
        this.credentials = options.auth;
        this.config = options.config;

        this.connection = null;
        this.connected = false;
    }

    connect() {
        return co(this._connect.bind(this));
    }

    * _connect() {
        const accountUri = this.credentials.account;

        if (this.connection) {
            console.warn('already connected, ignoring connection request');
            return Promise.resolve(null);
        }

        console.log('connecting to account ' + accountUri);
        const streamUri = accountUri;
        console.log('subscribing to ' + streamUri);

        const reconnect = reconnectCore(() => {
            return new SimpleWebsocket(streamUri);
        });

        return new Promise((resolve, reject) => {
            this.connection = reconnect({immediate: true}, (ws) => {
                ws.on('open', () => {
                    console.log('ws connected to ' + streamUri);
                })
                ws.on('data', (msg) => {
                    const notification = JSON.parse(msg);
                    co.wrap(this._handleNotification)
                        .call(this, notification)
                        .catch((err) => {
                            console.warn('failure while processing notification: ' +
                            (err && err.stack) ? err.stack : err)
                        });
                });
                ws.on('close', () => {
                    console.log('ws disconnected from ' + streamUri);
                });
            })
                .once('connect', () => resolve(null))
                .on('connect', () => {
                    this.connected = true;
                    this.emit('connect');
                })
                .on('disconnect', () => {
                    this.connected = false;
                    this.emit('disconnect');
                })
                .on('error', (err) => {
                    console.warn('ws error on ' + streamUri + ': ' + err);
                    reject(err);
                })
                .connect();
        });
    }

    disconnect() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = null;
        }
    }

    isConnected() {
        return this.connected;
    }


    getInfo() {
    }

    getBalance() {
    }

    getConnectors() {
    }

    send() {
    }

    fulfillCondition() {
    }

    replyToTransfer() {
    }

    * _handleNotification(changes) {
        yield this.emitAsync('incoming', changes);
    }
}

export default BigchainDBLedger;
