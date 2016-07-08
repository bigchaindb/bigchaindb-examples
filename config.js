'use strict';

const graph = {
    numLedgers: 2,
    numConnectors: 1,
    barabasiAlbertConnectedCore: 2,
    barabasiAlbertConnectionsPerNewNode: 2,
    adminUser: process.env.ADMIN_USER || 'admin',
    adminPass: process.env.ADMIN_PASS || 'admin'
}

if (process.env.DEMO_NUM_LEDGERS) {
    graph.numLedgers = parseInt(process.env.DEMO_NUM_LEDGERS, 10)
}

if (process.env.DEMO_NUM_CONNECTORS) {
    graph.numConnectors = parseInt(process.env.DEMO_NUM_CONNECTORS, 10)
}

// A higher number here will result in more highly connected central ledgers
if (process.env.DEMO_CONNECTED_CORE) {
    graph.barabasiAlbertConnectedCore = parseInt(process.env.DEMO_CONNECTED_CORE, 10)
}

// A higher number here will result in more connections between all ledgers
if (process.env.DEMO_CONNECTIONS_PER_NEW_NODE) {
    graph.barabasiAlbertConnectionsPerNewNode = parseInt(process.env.DEMO_CONNECTIONS_PER_NEW_NODE, 10)
}

export default graph;