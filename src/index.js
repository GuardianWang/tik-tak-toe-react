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
            currentStep: 0,
        };
    }
    
    handleClick(i) {
        if (this.state.winner !== null) {
            return;
        }
        const currentStep = this.state.currentStep;
        let history = this.state.history.slice(0, currentStep + 1);
        const squares = history[currentStep].squares.slice();
        squares[i] = this.state.symbols[this.state.playerID];
        this.setState({
            history: history.concat({
                squares: squares,
            }),
            playerID: 1 - this.state.playerID,
            winner: checkWinner(squares),
            currentStep: currentStep + 1,
        });
    }

    jumpTo(i) {
        this.setState({
            playerID: i % 2,
            currentStep: i,
            winner: checkWinner(this.state.history[i].squares),
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
            if (idx == 0) {
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
                        // Use arrow function instead of simply this.handleClick
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className='game-info'>
                    <div className='status'>{status}</div>
                    <ol>{jumpButtons}</ol>
                </div>
            </div>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
