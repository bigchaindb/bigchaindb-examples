import React from 'react';

import Matrix from 'react-matrix';

import AssetStore from '../../../lib/js/react/stores/asset_store';


const AssetMatrix = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        cols: React.PropTypes.number,
        handleAssetClick: React.PropTypes.func,
        rows: React.PropTypes.number,
        squareSize: React.PropTypes.number,
        states: React.PropTypes.object
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
        };
    },

    getInitialState() {
        return AssetStore.getState();
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    initializeMatrix(rows, cols) {
        const matrix = new Array(cols);

        for (let i = 0; i < rows; i++) {
            matrix[i] = new Array(cols);

            for (let j = 0; j < cols; j++) {
                matrix[i][j] = 'default';
            }
        }
        return matrix;
    },

    mapAssetsOnMatrix() {
        const { rows, cols } = this.props;
        const matrix = this.initializeMatrix(cols, rows);

        for (const content of this.getAssetListContent()) {
            matrix[content.y][content.x] = content.vk;
        }

        return matrix;
    },


    getAssetListContent() {
        const { activeAccount } = this.props;
        const { assetList } = this.state;

        if (!assetList || !activeAccount || Object.keys(assetList).indexOf(activeAccount.vk) < 0) {
            return [];
        } else {
            return assetList[activeAccount.vk].map((asset) => ({
                vk: asset.transaction.conditions[0].new_owners[0],
                x: asset.transaction.data.payload.content.x,
                y: asset.transaction.data.payload.content.y
            }));
        }
    },

    getAssetForCell(x, y) {
        const { activeAccount } = this.props;
        const { assetList } = this.state;

        if (!assetList || !activeAccount || Object.keys(assetList).indexOf(activeAccount.vk) < 0) {
            return null;
        } else {
            for (const asset of assetList[activeAccount.vk]) {
                const content = asset.transaction.data.payload.content;

                if (content.x === x && content.y === y) {
                    return asset;
                }
            }
        }

        return null;
    },

    handleCellClick(cellState) {
        const { handleAssetClick } = this.props;

        const x = parseInt(cellState.x, 10);
        const y = parseInt(cellState.y, 10);

        const activeAsset = this.getAssetForCell(x, y);
        handleAssetClick(activeAsset);
    },

    render() {
        const { squareSize, states } = this.props;

        return (
            <div style={{ textAlign: 'center' }}>
                <Matrix
                    cellStates={states}
                    matrix={this.mapAssetsOnMatrix()}
                    onCellClick={this.handleCellClick}
                    squareSize={squareSize} />
            </div>
        );
    }
});


export default AssetMatrix;
