import * as math from 'mathjs';
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

class Square extends Component {
    
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.value !== this.props.value || nextProps.color !== this.props.color;
    }

    render() {
        return (
            <button 
                className='square' 
                onClick={this.props.onClick}
                style={{backgroundColor: this.props.color}}
            >
                {this.props.value}
            </button>
        )
    }
}

/**
* Retrieve a row from a matrix
*/
function row(matrix, index) {
    let rows = math.size(matrix).valueOf()[1];
    return math.flatten(math.subset(matrix, math.index(index, math.range(0, rows)))).toArray();
}

function checkWinner(squares) {
    const indices = math.range(0, 9);
    const matrixBoard = math.matrix(math.reshape(indices, [3, 3]));
    const transposed = math.transpose(matrixBoard);
    const diagonal = math.matrix([[0, 4, 8], [2, 4, 6]]);
    const checkIdx = math.concat(matrixBoard, transposed, diagonal, 0);
    const res = {winner: null, indices: null};
    for (let i = 0; i < checkIdx.size()[0]; i++) {
        let line = row(checkIdx, i);
        let [sa, sb, sc] = math.subset(squares, math.index(line));
        if (sa !== null && sa === sb && sb === sc) {
            res.winner = sa;
            res.indices = line;
            return res;
        }
    }
    return res;
}

class Board extends Component {
    renderSquare(i) {
        return <Square key={i}
                    value={this.props.squares[i]} 
                    color={this.props.colors[i]} 
                    onClick={() => this.props.onClick(i)} 
                />;
    }

    makeRow(rowId, colNum) {
        const cols = [];
        for (let i = 0; i < colNum; ++i) {
            cols.push(this.renderSquare(rowId * colNum + i));
        }
        return <div className='board-row' key={rowId}>{cols}</div>;
    }

    render() {
        const rows = [];
        const rowNum = 3, colNum = 3;
        for (let i = 0; i < rowNum; ++i) {
            rows.push(this.makeRow(i, colNum));
        }

        return <div>{rows}</div>;
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.size = 9;
        this.successColor = 'yellow';
        this.state = {
            symbols: ['X', 'O'],
            playerID: 0,
            history: [{
                squares: Array(9).fill(null),
            }],
            colors: Array(9).fill(null),
            winner: null,
            currentStep: 0,
        };
    }
    
    getColors(indices) {
        const colors = Array(this.size).fill(null);
        if (indices !== null) {
            for (let idx of indices) {
                colors[idx] = this.successColor;
            }
        }
        return colors
    }
    
    handleClick(i) {
        this.setState((state, props) => {
            if (state.winner !== null) {
                return {};
            }
            const currentStep = state.currentStep;
            let history = state.history.slice(0, currentStep + 1);
            const squares = history[currentStep].squares.slice();
            if (squares[i] !== null) {
                return {};
            }
            squares[i] = state.symbols[state.playerID];
            const winnerRes = checkWinner(squares);
            
            return {
                history: history.concat({
                    squares: squares,
                }),
                playerID: 1 - state.playerID,
                winner: winnerRes.winner,
                colors: this.getColors(winnerRes.indices),
                currentStep: currentStep + 1,
            };
        });
    }

    jumpTo(i) {
        this.setState((state, props) => {
            const winnerRes = checkWinner(state.history[i].squares);
            return {
                playerID: i % 2,
                currentStep: i,
                winner: winnerRes.winner,
                colors: this.getColors(winnerRes.indices),
            };
        });
    }

    render() {
        let status = '';
        if (this.state.winner !== null) {
            status = `Winner: ${this.state.winner}`;
        } else if (this.state.currentStep < 9) {
            status = `Next player: ${this.state.symbols[this.state.playerID]}`;
        } else {
            status = 'Tie!';
        }
        const history = this.state.history;
        const current = history[this.state.currentStep];
        const jumpButtons = this.state.history.map((_unused, idx) => {
            let info;
            if (idx === 0) {
                info = 'Jump to start';
            } else {
                info = `Jump to move ${idx}`;
            }
            return (
                <li key={idx}>
                    <button onClick={() => this.jumpTo(idx)}>{info}</button>
                </li>
            )
        });

        return (
            <div className='game'>
                <div className='game-board'>
                    <Board 
                        squares={current.squares}
                        colors={this.state.colors}
                        // Use arrow function instead of simply this.handleClick
                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Boxing_with_prototype_and_static_methods
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className='game-info'>
                    <div className='status'>{status}</div>
                    <ol>{jumpButtons}</ol>
                </div>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
