'use strict';

import React from 'react/';

import Matrix from 'react-matrix';


const AssetMatrix = React.createClass({

    propTypes: {
        rows: React.PropTypes.number,
        cols: React.PropTypes.number,
        squareSize: React.PropTypes.number,
        states: React.PropTypes.object,
        assetList: React.PropTypes.object.isRequired,
        activeAccount: React.PropTypes.object.isRequired
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

    getInitialState() {
        let { rows, cols } = this.props;

        return {
          matrix: this.initializeMatrix(rows,cols)
        }
    },

    initializeMatrix(rows, cols) {
        let matrix = new Array(cols);
        for (let i = 0; i < rows; i++) {
          matrix[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = '0';
            }
        }
        return matrix
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
        const { squareSize, states } = this.props;

        return (
            <div style={{textAlign: 'center'}}>
                <Matrix squareSize={squareSize}
                    matrix={matrix}
                    onCellClick={this.handleCellClick}
                    cellStates={states} />
            </div>
        );
    }
});


export default AssetMatrix;
