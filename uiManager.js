import { AIController } from './aiController.js';

export class UIManager {
    constructor(gameLogic, languageManager) {
        this.gameLogic = gameLogic;
        this.languageManager = languageManager;
        
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameStatusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');
        this.gameBoard = document.getElementById('game-board');
        
        this.createNumberSelector();
        this.createScoreDisplay();
        this.setupModeSelector();
        this.setupLanguageSelector();
        this.setupPlayModeSelector();
        this.setupSettingsDropdown();
        this.setupRulesModal();

        this.ai = new AIController(this.gameLogic, this);

        this.initializeEventListeners();
    }
    
    createNumberSelector() {
        const container = document.querySelector('.container');
        const numberSelector = document.createElement('div');
        numberSelector.className = 'number-selector';
        numberSelector.id = 'number-selector';
        
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => this.selectNumber(i));
            numberSelector.appendChild(btn);
        }
        
        container.insertBefore(numberSelector, this.gameBoard);
    }
    
    createScoreDisplay() {
        const container = document.querySelector('.container');
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display hidden';
        scoreDisplay.id = 'score-display';
        scoreDisplay.innerHTML = `
            <div>Blue (O): <span id="player1-score">0</span></div>
            <div>Red (X): <span id="player2-score">0</span></div>
        `;
        container.insertBefore(scoreDisplay, this.resetButton);
    }
    
    setupModeSelector() {
        const modeInputs = document.querySelectorAll('input[name="mode"]');
        modeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                // Apply the selected mode to game logic then reset the game to apply changes immediately
                this.gameLogic.mode = e.target.value;
                this.resetGame();
            });
        });
    }

    setupPlayModeSelector() {
        const playModeInputs = document.querySelectorAll('input[name="play-mode"]');
        const startingPlayerInputs = document.querySelectorAll('input[name="starting-player"]');

        const applySettingsAndReset = () => {
            const selectedMode = document.querySelector('input[name="play-mode"]:checked')?.value || 'local';
            const selectedStarter = document.querySelector('input[name="starting-player"]:checked')?.value || 'blue';

            const isVsComputer = selectedMode === 'computer';
            const humanPlayer = selectedStarter === 'blue' ? 1 : 2;

            this.gameLogic.setPlayMode(isVsComputer, humanPlayer);
            this.resetGame();
        };

        playModeInputs.forEach(input => {
            input.addEventListener('change', applySettingsAndReset);
        });

        startingPlayerInputs.forEach(input => {
            input.addEventListener('change', applySettingsAndReset);
        });

        // Initialize default play mode
        applySettingsAndReset();
    }
    
    setupLanguageSelector() {
        const languageInputs = document.querySelectorAll('input[name="language"]');
        languageInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.languageManager.setLanguage(e.target.value);
                this.languageManager.updateUI();
                this.updateDisplay();
            });
        });
    }
    
    setupRulesModal() {
        const rulesBtn = document.getElementById('rules-btn');
        const modal = document.getElementById('rules-modal');
        const closeBtn = document.getElementById('close-modal');
        
        rulesBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    setupSettingsDropdown() {
        // Now uses a modal-style settings popup instead of an inline dropdown
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsClose = document.getElementById('settings-close');
        
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsModal.style.display = 'block';
        });
        
        settingsClose.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
        
        // Close modal when clicking outside content
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    initializeEventListeners() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.updateDisplay();
        if (this.ai) {
            this.ai.maybeAIMoveWithDelay();
        }
    }
    
    selectNumber(number) {
        // Block human input when it's computer's turn
        if (this.gameLogic.isVsComputer && this.gameLogic.currentPlayer !== this.gameLogic.humanPlayer) return;

        if (!this.gameLogic.selectNumber(number)) return;
        
        // Remove previous selection
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Select new number
        document.querySelector(`.number-btn:nth-child(${number})`).classList.add('selected');
    }
    
    handleCellClick(index) {
        if (!this.gameLogic.gameActive) return;

        // Block human input when it's computer's turn
        if (this.gameLogic.isVsComputer && this.gameLogic.currentPlayer !== this.gameLogic.humanPlayer) return;
        
        if (this.gameLogic.phase === 'numbers') {
            this.handleNumberPlacement(index);
        } else if (this.gameLogic.phase === 'symbols') {
            this.handleSymbolPlacement(index);
        }

        if (this.ai) {
            this.ai.maybeAIMoveWithDelay();
        }
    }
    
    handleNumberPlacement(index) {
        const result = this.gameLogic.placeNumber(index);
        if (!result) return;
        
        // Update UI
        const cell = this.cells[index];
        cell.textContent = this.gameLogic.numberBoard[index];
        cell.classList.add(`player${this.gameLogic.lastPlayerToPlaceNumber}`);
        
        // Mark number as used
        document.querySelector(`.number-btn:nth-child(${this.gameLogic.numberBoard[index]})`).classList.add('used');
        document.querySelectorAll('.number-btn').forEach(btn => btn.classList.remove('selected'));
        
        if (result.phaseChange) {
            this.startSymbolPhase();
        } else {
            this.updateDisplay();
        }
    }
    
    startSymbolPhase() {
        // Clear the board for symbols based on mode
        this.cells.forEach((cell, index) => {
            if (this.gameLogic.mode === 'hard') {
                cell.textContent = '';
            } else {
                // In normal mode, keep numbers visible but style them differently
                cell.textContent = this.gameLogic.numberBoard[index];
                cell.classList.add('number-visible');
            }
            cell.classList.remove('player1', 'player2');
        });
        
        // Hide number selector
        document.getElementById('number-selector').style.display = 'none';
        
        this.updateDisplay();
    }
    
    handleSymbolPlacement(index) {
        const moveResult = this.gameLogic.placeSymbol(index);
        if (!moveResult) return;
        
        const { symbol, result: gameResult } = moveResult;
        const cell = this.cells[index];
        
        if (this.gameLogic.mode === 'normal') {
            // Show both number and symbol with proper coloring
            const symbolClass = symbol === 'O' ? 'o' : '';
            cell.innerHTML = `<span class="number">${this.gameLogic.numberBoard[index]}</span><span class="symbol ${symbolClass}">${symbol}</span>`;
        } else {
            // Show only symbol
            cell.textContent = symbol;
        }
        
        cell.classList.add('taken', symbol.toLowerCase());
        
        if (gameResult.gameOver) {
            this.handleGameEnd(gameResult);
        } else {
            this.updateDisplay();
        }
    }
    
    handleGameEnd(result) {
        if (result.winner) {
            this.gameStatusElement.textContent = this.languageManager.t('player-wins', result.winner);
            this.currentPlayerElement.textContent = this.languageManager.t('game-over');
            this.gameBoard.classList.add('game-over');
            
            if (result.winningCombination) {
                result.winningCombination.forEach(index => {
                    this.cells[index].classList.add('winning');
                });
            }
        } else if (result.tie) {
            this.handleTieGame(result.scores);
        }
    }
    
    handleTieGame(scores) {
        const { player1Score, player2Score } = scores;
        
        // In hard mode, reveal the numbers when game ends
        if (this.gameLogic.mode === 'hard') {
            this.cells.forEach((cell, index) => {
                if (this.gameLogic.board[index]) {
                    const symbol = this.gameLogic.board[index];
                    const symbolClass = symbol === 'O' ? 'o' : '';
                    cell.innerHTML = `<span class="number">${this.gameLogic.numberBoard[index]}</span><span class="symbol ${symbolClass}">${symbol}</span>`;
                    cell.classList.add('number-visible');
                } else {
                    // For empty cells, just show the number
                    cell.textContent = this.gameLogic.numberBoard[index];
                    cell.classList.add('number-visible');
                }
            });
        }
        
        document.getElementById('player1-score').textContent = player1Score;
        document.getElementById('player2-score').textContent = player2Score;
        document.getElementById('score-display').classList.remove('hidden');
        
        this.gameBoard.classList.add('game-over');
        
        if (player1Score > player2Score) {
            this.gameStatusElement.textContent = this.languageManager.t('player-wins-score', 1);
        } else if (player2Score > player1Score) {
            this.gameStatusElement.textContent = this.languageManager.t('player-wins-score', 2);
        } else {
            this.gameStatusElement.textContent = this.languageManager.t('tie');
        }
        
        this.currentPlayerElement.textContent = this.languageManager.t('game-over');
    }
    
    updateDisplay() {
        if (!this.gameLogic.gameActive) return;
        
        if (this.gameLogic.phase === 'numbers') {
            this.currentPlayerElement.textContent = this.languageManager.t('player-turn', this.gameLogic.currentPlayer);
            this.gameStatusElement.textContent = this.languageManager.t('place-numbers');
            document.getElementById('phase-indicator').textContent = this.languageManager.t('number-phase');
        } else if (this.gameLogic.phase === 'symbols') {
            // Reflect swapped symbols: Player 1 -> 'O', Player 2 -> 'X'
            const symbol = this.gameLogic.currentPlayer === 1 ? 'O' : 'X';
            this.currentPlayerElement.textContent = this.languageManager.t('player-symbol-turn', this.gameLogic.currentPlayer, symbol);
            
            // Check if it's the first move
            if (this.gameLogic.board.every(cell => cell === '')) {
                this.gameStatusElement.textContent = this.languageManager.t('first-move');
            } else {
                this.gameStatusElement.textContent = this.languageManager.t('play-tictactoe');
            }
            
            document.getElementById('phase-indicator').textContent = this.languageManager.t('tictactoe-phase');
        }
    }
    
    resetGame() {
        this.gameLogic.reset();
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.innerHTML = '';
            cell.classList.remove('taken', 'x', 'o', 'winning', 'player1', 'player2', 'number-visible');
        });
        
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('used', 'selected');
        });
        
        document.getElementById('number-selector').style.display = 'flex';
        document.getElementById('score-display').classList.add('hidden');
        this.gameBoard.classList.remove('game-over');
        this.updateDisplay();
        if (this.ai) {
            this.ai.maybeAIMoveWithDelay();
        }
    }
}