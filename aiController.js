export class AIController {
    constructor(gameLogic, uiManager) {
        this.gameLogic = gameLogic;
        this.uiManager = uiManager;
    }

    maybeAIMoveWithDelay() {
        if (!this.gameLogic.isVsComputer) return;
        // Slight delay to feel more natural
        setTimeout(() => this.maybeAIMove(), 400);
    }

    maybeAIMove() {
        if (!this.gameLogic.isVsComputer) return;
        if (!this.gameLogic.gameActive) return;
        if (this.gameLogic.currentPlayer === this.gameLogic.humanPlayer) return;

        if (this.gameLogic.phase === 'numbers') {
            this.aiNumberMove();
        } else if (this.gameLogic.phase === 'symbols') {
            this.aiSymbolMove();
        }
    }

    aiNumberMove() {
        // Choose the largest available number and place it on a strategically chosen empty cell
        const availableNumbers = [];
        for (let n = 1; n <= 9; n++) {
            if (!this.gameLogic.usedNumbers.has(n)) availableNumbers.push(n);
        }
        if (availableNumbers.length === 0) return;

        // Use the highest remaining number to maximize potential score
        const number = availableNumbers[availableNumbers.length - 1];
        this.gameLogic.selectedNumber = number;

        const emptyIndices = [];
        this.uiManager.cells.forEach((cell, idx) => {
            if (this.gameLogic.numberBoard[idx] === '') emptyIndices.push(idx);
        });
        if (emptyIndices.length === 0) return;

        // Prefer center, then corners, then any edge among empty cells
        const center = 4;
        let index = null;

        if (emptyIndices.includes(center)) {
            index = center;
        } else {
            const corners = [0, 2, 6, 8].filter(i => emptyIndices.includes(i));
            const edges = [1, 3, 5, 7].filter(i => emptyIndices.includes(i));

            if (corners.length > 0) {
                index = corners[Math.floor(Math.random() * corners.length)];
            } else {
                index = edges[Math.floor(Math.random() * edges.length)];
            }
        }

        // Reuse UI logic for placing numbers
        this.uiManager.handleNumberPlacement(index);
    }

    // --- Minimax helpers for symbol phase ---

    checkWinForSymbol(board, symbol) {
        for (const [a, b, c] of this.gameLogic.winningConditions) {
            if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
                return true;
            }
        }
        return false;
    }

    computeScores(board, numberBoard, aiSymbol, opponentSymbol) {
        let aiScore = 0;
        let oppScore = 0;
        for (let i = 0; i < 9; i++) {
            if (board[i] === aiSymbol) {
                aiScore += numberBoard[i];
            } else if (board[i] === opponentSymbol) {
                oppScore += numberBoard[i];
            }
        }
        return { aiScore, oppScore };
    }

    minimax(board, numberBoard, depth, isMaximizing, aiSymbol, opponentSymbol) {
        // Terminal state checks
        if (this.checkWinForSymbol(board, aiSymbol)) {
            return 10 - depth;
        }
        if (this.checkWinForSymbol(board, opponentSymbol)) {
            return depth - 10;
        }
        if (!board.includes('')) {
            // Tie: use number sum as tie-breaker
            const { aiScore, oppScore } = this.computeScores(board, numberBoard, aiSymbol, opponentSymbol);
            if (aiScore > oppScore) return 2;     // slight win
            if (aiScore < oppScore) return -2;    // slight loss
            return 0;                             // true tie
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiSymbol;
                    const score = this.minimax(board, numberBoard, depth + 1, false, aiSymbol, opponentSymbol);
                    board[i] = '';
                    if (score > bestScore) bestScore = score;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = opponentSymbol;
                    const score = this.minimax(board, numberBoard, depth + 1, true, aiSymbol, opponentSymbol);
                    board[i] = '';
                    if (score < bestScore) bestScore = score;
                }
            }
            return bestScore;
        }
    }

    // Use minimax to choose the best symbol move, respecting the "first move on 1" rule
    computeBestSymbolMoveWithMinimax() {
        const board = [...this.gameLogic.board];
        const numberBoard = this.gameLogic.numberBoard;
        const currentSymbol = this.gameLogic.currentPlayer === 1 ? 'O' : 'X';
        const opponentSymbol = currentSymbol === 'O' ? 'X' : 'O';

        const isFirstMove = board.every(cell => cell === '');
        const numberOneIndex = numberBoard.indexOf(1);

        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            // Respect first move rule
            if (isFirstMove) {
                if (i !== numberOneIndex) continue;
            }
            if (board[i] !== '') continue;

            board[i] = currentSymbol;
            const score = this.minimax(board, numberBoard, 0, false, currentSymbol, opponentSymbol);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }

        return bestMove;
    }

    aiSymbolMove() {
        const index = this.computeBestSymbolMoveWithMinimax();
        if (index === null || index === undefined) return;

        // Reuse UI logic for placing symbols
        this.uiManager.handleSymbolPlacement(index);
    }
}