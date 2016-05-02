'use strict';

import React from 'react/';

import Matrix from 'react-matrix';

import AssetStore from '../../../lib/js/react/stores/asset_store';
import AccountStore from '../../../lib/js/react/stores/account_store';

import { mergeOptions } from '../../../lib/js/utils/general_utils';


const AssetMatrix = React.createClass({

    propTypes: {
        rows: React.PropTypes.number,
        cols: React.PropTypes.number,
        squareSize: React.PropTypes.number
    },

    getDefaultProps() {
        return {
            rows: 8,
            cols: 8,
            squareSize: 50,
            states: {
                '0': 'available',
                '1': 'state1',
                '2': 'state2',
                '3': 'state3',
                '4': 'state4'
            }
        }
    },

    getInitialState() {
        const assetStore = AssetStore.getState();
        const accountStore = AccountStore.getState();

        return mergeOptions(
            accountStore,
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
        AccountStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    initializeMatrix(rows, cols) {
        let matrix = new Array(cols);
        for (let i = 0; i < rows; i++) {
          matrix[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = 'default';
            }
        }
        return matrix
    },

    mapAssetsOnMatrix(assetList) {
        let matrix = this.initializeMatrix(8, 8);
        let assetListContent = this.getAssetListContent(assetList);
        for (let content of assetListContent) {
            matrix[content.y][content.x] = content.vk;
        }
        return matrix
    },

    mapAccountsOnStates(accountList) {
        let states = {'default': 'available'};
        if (!accountList) {
            return states;
        }
        for (let i = 0; i < accountList.length; i++){
            states[accountList[i].vk] = 'state' + i;
        }
        return states;
    },

    getAssetListContent(assetList) {
        if (!assetList) {
            return [];
        }
        assetList = assetList.bigchain.concat(assetList.backlog);

        return assetList.map(( asset ) => {
            return {
                vk: asset.transaction.new_owner,
                x: asset.transaction.data.payload.content.x,
                y: asset.transaction.data.payload.content.y
            };
        });
    },

    handleCellClick(cellState) {

        let x = parseInt(cellState.x, 10);
        let y = parseInt(cellState.y, 10);
        console.log(x, y)
    },

    render() {
        const { squareSize } = this.props;
        const { accountList, assetList } = this.state;

        const states=this.mapAccountsOnStates( accountList );
        const matrix=this.mapAssetsOnMatrix( assetList );

        return (
            <div style={{textAlign: 'center'}}>
                <Matrix
                    squareSize={squareSize}
                    matrix={matrix}
                    onCellClick={this.handleCellClick}
                    cellStates={states} />
            </div>
        );
    }
});


export default AssetMatrix;
