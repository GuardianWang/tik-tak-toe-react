import * as math from 'mathjs';
import React, { Children, Component } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

class Square extends Component {
    
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.value !== this.props.value;
    }

    render() {
        return (
            <button 
                className='square' 
                onClick={this.props.onClick}
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
    for (let i = 0; i < checkIdx.size()[0]; i++) {
        let line = row(checkIdx, i);
        let [sa, sb, sc] = math.subset(squares, math.index(line));
        if (sa !== null && sa === sb && sb === sc) {
            return sa;
        }
    }
    return null;
}

class Board extends Component {
    renderSquare(i) {
        return <Square 
                    value={this.props.squares[i]} 
                    onClick={() => this.props.onClick(i)} 
                />;
    }

    render() {
        return (
            <div>
                <div className='board-row'>
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        )
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            symbols: ['X', 'O'],
            playerID: 0,
            history: [{
                squares: Array(9).fill(null),
            }],
            winner: null,
        };
    }
    
    handleClick(i) {
        if (this.state.winner !== null) {
            return;
        }
        let history = this.state.history;
        const squares = history[history.length - 1].squares.slice();
        squares[i] = this.state.symbols[this.state.playerID];
        this.setState({
            history: history.concat({
                squares: squares,
            }),
            playerID: 1 - this.state.playerID,
            winner: checkWinner(squares),
        });
    }

    render() {
        let status = '';
        if (this.state.winner !== null) {
            status = `Winner: ${this.state.winner}`;
        } else {
            status = `Next player: ${this.state.symbols[this.state.playerID]}`;
        }
        const history = this.state.history;
        const current = history[history.length - 1];

        return (
            <div className='game'>
                <div className='game-board'>
                    <Board 
                        squares={current.squares}
                        // Use arrow function instead of simply this.handleClick
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className='game-info'>
                    <div className='status'>{status}</div>
                    <ol></ol>
                </div>
            </div>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
