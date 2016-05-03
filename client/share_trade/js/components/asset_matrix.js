'use strict';

import React from 'react/';

import Matrix from 'react-matrix';

import AssetStore from '../../../lib/js/react/stores/asset_store';

import { mergeOptions } from '../../../lib/js/utils/general_utils';


const AssetMatrix = React.createClass({

    propTypes: {
        rows: React.PropTypes.number,
        cols: React.PropTypes.number,
        squareSize: React.PropTypes.number,
        states : React.PropTypes.object,
        handleAssetClick: React.PropTypes.func
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
                '4': 'state4',
                '5': 'state5',
                '6': 'state6',
                '7': 'state7',
                '8': 'state8'
            }
        }
    },

    getInitialState() {
        const assetStore = AssetStore.getState();
        
        return mergeOptions(
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen( this.onChange );
    },

    componentWillUnmount() {
        AssetStore.unlisten( this.onChange );
    },

    onChange(state) {
        this.setState( state );
    },

    initializeMatrix(rows, cols) {
        let matrix = new Array( cols );
        
        for ( let i = 0; i < rows; i++ ) {
          matrix[i] = new Array( cols );
        
            for ( let j = 0; j < cols; j++ ) {
                matrix[i][j] = 'default';
            }
        }
        return matrix
    },

    mapAssetsOnMatrix() {
        const { rows, cols } = this.props;
        let matrix = this.initializeMatrix( cols, rows );
        
        for ( let content of this.getAssetListContent() ) {
            matrix[content.y][content.x] = content.vk;
        }
        return matrix
    },


    getAssetListContent() {
        const { assetList } = this.state;
        
        if (!assetList) {
            return [];
        }

        return assetList.map(( asset ) => {
            return {
                vk: asset.transaction.conditions[0].new_owners[0],
                x: asset.transaction.data.payload.content.x,
                y: asset.transaction.data.payload.content.y
            };
        });
    },

    getAssetForCell(x, y) {
        const { assetList } = this.state;
        
        for ( let asset of assetList ) {
            let content = asset.transaction.data.payload.content;
        
            if ( content.x === x && content.y === y ) {
                return asset
            }
        }
        return null;
    },

    handleCellClick(cellState) {
        const { handleAssetClick } = this.props;

        const x = parseInt( cellState.x, 10 );
        const y = parseInt( cellState.y, 10 );

        const activeAsset = this.getAssetForCell( x, y );
        handleAssetClick( activeAsset )
    },

    render() {
        const { squareSize, states } = this.props;
        
        return (
            <div style={{ textAlign: 'center' }}>
                <Matrix
                    squareSize={ squareSize }
                    matrix={ this.mapAssetsOnMatrix() }
                    onCellClick={ this.handleCellClick }
                    cellStates={ states } />
            </div>
        );
    }
});


export default AssetMatrix;
