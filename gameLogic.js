export class GameLogic {
    constructor() {
        this.board = Array(9).fill('');
        this.numberBoard = Array(9).fill('');
        this.currentPlayer = 1; // 1 or 2
        this.gameActive = true;
        this.phase = 'numbers'; // 'numbers' or 'symbols' or 'finished'
        this.selectedNumber = null;
        this.usedNumbers = new Set();
        this.lastPlayerToPlaceNumber = null;
        this.mode = 'normal'; // 'normal' or 'hard'

        // vs computer settings
        this.isVsComputer = false;
        this.humanPlayer = 1; // 1 = Blue, 2 = Red
        
        // Define winning conditions for tic-tac-toe
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
    }

    setPlayMode(isVsComputer, humanPlayer) {
        this.isVsComputer = isVsComputer;
        this.humanPlayer = humanPlayer;
    }
    
    selectNumber(number) {
        if (this.phase !== 'numbers' || this.usedNumbers.has(number)) return false;
        this.selectedNumber = number;
        return true;
    }
    
    placeNumber(index) {
        if (this.numberBoard[index] !== '' || this.selectedNumber === null) return false;
        
        this.numberBoard[index] = this.selectedNumber;
        this.usedNumbers.add(this.selectedNumber);
        this.lastPlayerToPlaceNumber = this.currentPlayer;
        this.selectedNumber = null;
        
        // Check if all numbers are placed
        if (this.usedNumbers.size === 9) {
            this.startSymbolPhase();
            return { phaseChange: true };
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            return { phaseChange: false };
        }
    }
    
    startSymbolPhase() {
        this.phase = 'symbols';
        this.currentPlayer = this.lastPlayerToPlaceNumber === 1 ? 2 : 1; // Other player starts
    }
    
    placeSymbol(index) {
        if (this.board[index] !== '') return false;
        
        // Force first move to be on the cell with number 1
        if (this.board.every(cell => cell === '')) {
            const numberOneIndex = this.numberBoard.indexOf(1);
            if (index !== numberOneIndex) {
                return false; // Ignore clicks on other cells for first move
            }
        }
        
        // Swapped symbols: Player 1 -> 'O', Player 2 -> 'X'
        const symbol = this.currentPlayer === 1 ? 'O' : 'X';
        this.board[index] = symbol;
        
        const result = this.checkResult();
        if (!result.gameOver) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        
        return { symbol, result };
    }
    
    checkResult() {
        let roundWon = false;
        let winningCombination = null;
        
        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                roundWon = true;
                winningCombination = [a, b, c];
                break;
            }
        }
        
        if (roundWon) {
            this.gameActive = false;
            return { gameOver: true, winner: this.currentPlayer, winningCombination };
        }
        
        if (!this.board.includes('')) {
            const scores = this.calculateScores();
            this.gameActive = false;
            return { gameOver: true, tie: true, scores };
        }
        
        return { gameOver: false };
    }
    
    calculateScores() {
        let player1Score = 0;
        let player2Score = 0;
        
        for (let i = 0; i < 9; i++) {
            // Adjusted scoring to match swapped symbols:
            // Red uses 'X', Blue uses 'O'
            if (this.board[i] === 'O') {
                player1Score += this.numberBoard[i];
            } else if (this.board[i] === 'X') {
                player2Score += this.numberBoard[i];
            }
        }
        
        return { player1Score, player2Score };
    }
    
    reset() {
        this.board = Array(9).fill('');
        this.numberBoard = Array(9).fill('');
        this.currentPlayer = 1;
        this.gameActive = true;
        this.phase = 'numbers';
        this.selectedNumber = null;
        this.usedNumbers.clear();
        this.lastPlayerToPlaceNumber = null;
    }
}