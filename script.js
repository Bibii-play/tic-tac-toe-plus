import { GameLogic } from './gameLogic.js';
import { LanguageManager } from './languageManager.js';
import { UIManager } from './uiManager.js';

class TicTacToe {
    constructor() {
        this.gameLogic = new GameLogic();
        this.languageManager = new LanguageManager();
        this.uiManager = new UIManager(this.gameLogic, this.languageManager);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});