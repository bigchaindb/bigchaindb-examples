'use strict';

import React from 'react/';

import Matrix from 'react-matrix';


const SQUARE_SIZE = 40;

const STATES = {
  '0': 'available',
  '1': 'barrier'
};

function generateMatrix(rows, cols) {
    let matrix = new Array(cols);
    for (let i = 0; i < rows; i++) {
      matrix[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = '0';
        }
    }
    return matrix
}


const AssetMatrix = React.createClass({

    propTypes: {
        rows: React.PropTypes.number,
        cols: React.PropTypes.number,
        assetList: React.PropTypes.object,
        activeAccount: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            rows: 16,
            cols: 8
        }
    },

    getInitialState() {
        let { rows, cols } = this.props;

        return {
          matrix: generateMatrix(rows,cols)
        }
    },

    handleCellClick(cellState) {
        let { matrix } = this.state;

        let y = parseInt(cellState.x, 10);
        let x = parseInt(cellState.y, 10);

        matrix[x][y] = '1';
        
        this.setState({
            matrix: matrix
        });
    },

    render() {
        const { matrix } = this.state;

        return (
            <div style={{textAlign: 'center'}}>
                <Matrix squareSize={SQUARE_SIZE}
                    matrix={matrix}
                    onCellClick={this.handleCellClick}
                    cellStates={STATES} />
            </div>
        );
    }
});


export default AssetMatrix;
