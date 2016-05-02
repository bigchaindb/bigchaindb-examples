'use strict';

import React from 'react/';

import Matrix from 'react-matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';


const AssetMatrix = React.createClass({

    propTypes: {
        rows: React.PropTypes.number,
        cols: React.PropTypes.number,
        squareSize: React.PropTypes.number,
        states: React.PropTypes.object,
        matrix: React.PropTypes.array.isRequired
    },

    getDefaultProps() {
        return {
            rows: 8,
            cols: 8,
            squareSize: 50,
            states: {
                '0': 'available',
                '1': 'barrier'
            }
        }
    },

    handleCellClick(cellState) {
        let { matrix } = this.props;

        let y = parseInt(cellState.x, 10);
        let x = parseInt(cellState.y, 10);

        matrix[x][y] = '1';
    },

    render() {
        console.log('render matrix')
        const { squareSize, states, matrix } = this.props;

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
