'use strict';

const config = {
    numLedgers: 2,
    numConnectors: 1,
    barabasiAlbertConnectedCore: 2,
    barabasiAlbertConnectionsPerNewNode: 2,
    adminUser: process.env.ADMIN_USER || 'admin',
    adminPass: process.env.ADMIN_PASS || 'admin'
}

if (process.env.DEMO_NUM_LEDGERS) {
    config.numLedgers = parseInt(process.env.DEMO_NUM_LEDGERS, 10)
}

if (process.env.DEMO_NUM_CONNECTORS) {
    config.numConnectors = parseInt(process.env.DEMO_NUM_CONNECTORS, 10)
}

// A higher number here will result in more highly connected central ledgers
if (process.env.DEMO_CONNECTED_CORE) {
    config.barabasiAlbertConnectedCore = parseInt(process.env.DEMO_CONNECTED_CORE, 10)
}

// A higher number here will result in more connections between all ledgers
if (process.env.DEMO_CONNECTIONS_PER_NEW_NODE) {
    config.barabasiAlbertConnectionsPerNewNode = parseInt(process.env.DEMO_CONNECTIONS_PER_NEW_NODE, 10)
}

export default config;