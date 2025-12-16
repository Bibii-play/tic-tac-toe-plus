export class LanguageManager {
    constructor() {
        this.language = 'en'; // 'en' or 'ko'
        
        this.translations = {
            en: {
                title: 'Tic Tac Toe+',
                settings: 'Settings',
                'normal-mode': 'Normal',
                'hard-mode': 'Hard',
                'play-mode': 'Play Mode',
                'play-local': 'Local',
                'play-computer': 'Vs Computer',
                'starting-player': '(For Vs Mode) Computer plays',
                'blue-player': 'Blue',
                'red-player': 'Red',
                'player-turn': (player) => `${player === 1 ? 'Blue' : 'Red'}'s turn`,
                'player-symbol-turn': (player, symbol) => `${player === 1 ? 'Blue' : 'Red'} (${symbol})'s turn`,
                'place-numbers': 'Place numbers 1-9 in the cells',
                'first-move': 'First move must be on the cell with number 1',
                'play-tictactoe': 'Play Tic-Tac-Toe with the numbers',
                'number-phase': 'Number Placement Phase',
                'tictactoe-phase': 'Tic-Tac-Toe Phase',
                'player-wins': (player) => `${player === 1 ? 'Blue' : 'Red'} wins!`,
                'player-wins-score': (player) => `${player === 1 ? 'Blue' : 'Red'} wins by score!`,
                'tie': "It's a tie!",
                'game-over': 'Game Over',
                'rules-title': 'Game Rules',
                'rule-1': 'Each player takes turns placing numbers 1-9 on the board',
                'rule-2': 'After all numbers are placed, players take turns placing X and O symbols',
                'rule-3': 'The first symbol must be placed on the cell containing number 1',
                'rule-4': 'Win by getting three symbols in a row, column, or diagonal',
                'rule-5': 'If no one wins, the player with the highest sum of their numbers wins',
                'rule-6': 'Normal: Numbers remain visible during symbol phase',
                'rule-7': 'Hard: Numbers are hidden during symbol phase',
                'mode-desc-normal': 'Numbers remain visible during symbol phase',
                'mode-desc-hard': 'Numbers are hidden during symbol phase'
            },
            ko: {
                title: '틱택토 플러스',
                settings: '설정',
                'normal-mode': '일반',
                'hard-mode': '어려움',
                'play-mode': '플레이 모드',
                'play-local': '로컬',
                'play-computer': '컴퓨터와 대전',
                'starting-player': '(컴퓨터 대전에서) 컴퓨터 역할',
                'blue-player': '블루',
                'red-player': '레드',
                'player-turn': (player) => `${player === 1 ? '블루' : '레드'}의 차례`,
                'player-symbol-turn': (player, symbol) => `${player === 1 ? '블루' : '레드'} (${symbol})의 차례`,
                'place-numbers': '1-9 숫자를 칸에 배치하세요',
                'first-move': '첫 번째 수는 숫자 1이 있는 칸에 두어야 합니다',
                'play-tictactoe': '숫자 틱택토를 플레이하세요',
                'number-phase': '숫자 배치 단계',
                'tictactoe-phase': '틱택토 단계',
                'player-wins': (player) => `${player === 1 ? '블루' : '레드'} 승리!`,
                'player-wins-score': (player) => `${player === 1 ? '블루' : '레드'} 점수로 승리!`,
                'tie': '무승부!',
                'game-over': '게임 종료',
                'rules-title': '게임 규칙',
                'rule-1': '각 플레이어는 번갈아 가며 1-9 숫자를 보드에 배치합니다',
                'rule-2': '모든 숫자가 배치된 후, 플레이어들은 번갈아 가며 X와 O 기호를 배치합니다',
                'rule-3': '첫 번째 기호는 숫자 1이 있는 칸에 배치해야 합니다',
                'rule-4': '가로, 세로, 대각선으로 3개를 연결하면 승리합니다',
                'rule-5': '승부가 나지 않으면, 자신의 숫자 합이 더 높은 플레이어가 승리합니다',
                'rule-6': '일반: 기호 배치 단계에서도 숫자가 보입니다',
                'rule-7': '어려움: 기호 배치 단계에서 숫자가 숨겨집니다',
                'mode-desc-normal': '기호 배치 단계에서도 숫자가 보입니다',
                'mode-desc-hard': '기호 배치 단계에서 숫자가 숨겨집니다'
            }
        };
    }
    
    setLanguage(lang) {
        this.language = lang;
    }
    
    t(key, ...args) {
        const translation = this.translations[this.language][key];
        if (typeof translation === 'function') {
            return translation(...args);
        }
        return translation || key;
    }
    
    updateUI() {
        const t = this.translations[this.language];
        
        // Update title
        document.getElementById('game-title').textContent = t.title;
        
        // Update settings header
        const settingsHeader = document.querySelector('[data-lang-key="settings"]');
        if (settingsHeader) settingsHeader.textContent = t['settings'];
        
        // Update mode labels
        document.querySelector('[data-lang-key="normal-mode"]').textContent = t['normal-mode'];
        document.querySelector('[data-lang-key="hard-mode"]').textContent = t['hard-mode'];
        
        // Update play mode labels
        const playModeTitle = document.querySelector('[data-lang-key="play-mode"]');
        if (playModeTitle) playModeTitle.textContent = t['play-mode'];
        const playLocal = document.querySelector('[data-lang-key="play-local"]');
        if (playLocal) playLocal.textContent = t['play-local'];
        const playComputer = document.querySelector('[data-lang-key="play-computer"]');
        if (playComputer) playComputer.textContent = t['play-computer'];
        const startingPlayer = document.querySelector('[data-lang-key="starting-player"]');
        if (startingPlayer) startingPlayer.textContent = t['starting-player'];
        const bluePlayer = document.querySelector('[data-lang-key="blue-player"]');
        if (bluePlayer) bluePlayer.textContent = t['blue-player'];
        const redPlayer = document.querySelector('[data-lang-key="red-player"]');
        if (redPlayer) redPlayer.textContent = t['red-player'];
        
        // Update rules modal
        document.querySelector('[data-lang-key="rules-title"]').textContent = t['rules-title'];
        document.querySelector('[data-lang-key="rule-1"]').textContent = t['rule-1'];
        document.querySelector('[data-lang-key="rule-2"]').textContent = t['rule-2'];
        document.querySelector('[data-lang-key="rule-3"]').textContent = t['rule-3'];
        document.querySelector('[data-lang-key="rule-4"]').textContent = t['rule-4'];
        document.querySelector('[data-lang-key="rule-5"]').textContent = t['rule-5'];

        // Populate mode descriptions inside settings
        const normalDescEl = document.querySelector('[data-lang-key="mode-desc-normal"]');
        const hardDescEl = document.querySelector('[data-lang-key="mode-desc-hard"]');
        if (normalDescEl) normalDescEl.textContent = t['mode-desc-normal'];
        if (hardDescEl) hardDescEl.textContent = t['mode-desc-hard'];
    }
}