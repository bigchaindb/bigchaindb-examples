import co from 'co/';
import reconnectCore from 'reconnect-core/';
import EventEmitter2 from 'eventemitter2/';

class BigchainDBLedgerPlugin extends EventEmitter2 {

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
            return new WebSocket(streamUri);
        });

        return new Promise((resolve, reject) => {
            this.connection = reconnect({immediate: true}, (ws) => {
                ws.onopen = function () {
                    console.log('ws connected to ' + streamUri);
                };
                ws.onmessage = function (msg) {
                    const notification = JSON.parse(msg);
                    console.log('ws received ' + notification);
                };
                ws.onclose = function () {
                    console.log('ws disconnected from ' + streamUri);
                };
                // reconnect-core expects the disconnect method to be called: `end`
                ws.end = ws.close;
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

    * _handleNotification(fiveBellsTransfer, relatedResources) {
    }
}

export default BigchainDBLedgerPlugin;
