/**
 * HackingScene.js — Cryptographic bypass mini-game overlay
 */
class HackingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HackingScene' });
    }

    init(data) {
        this.parentScene = data.parentScene;
        this.terminalId = data.terminalId;
        this.difficulty = data.difficulty;
        this.isBossTerminal = data.isBossTerminal || false;

        // Scale length and timer based on difficulty settings
        const baseLen = CONSTANTS.HACKING.SEQUENCE_LENGTH_BASE;
        const baseTime = CONSTANTS.HACKING.TIME_LIMIT_BASE;

        const mult = this.difficulty.hackTimeMul; // 1.5 for easy, 1.0 normal, 0.7 hard
        this.sequenceLength = Math.max(3, Math.round(baseLen / mult));
        this.timeLimit = baseTime * mult;

        // Applying Hack Assist upgrade check
        const save = window.saveSystem.loadGame();
        if (save.upgrades.includes(CONSTANTS.UPGRADES.HACK_BOOST.id)) {
            this.timeLimit *= CONSTANTS.UPGRADES.HACK_BOOST.hackMul; // 30% extra time
            this.sequenceLength = Math.max(3, this.sequenceLength - 1); // 1 less node in sequence
        }

        this.sequence = [];
        this.playerInput = [];
        this.gameState = 'PLAYING'; // 'SHOWING', 'PLAYING', 'SUCCESS', 'FAILED'
        this.timeLeft = this.timeLimit;
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Stop keyboard input propagation to parent scene
        this.input.keyboard.clearCaptures();

        // Dark dim background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

        // Hacking Frame Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x0a0a20, 0.95);
        panel.fillRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 8);
        panel.lineStyle(2, CONSTANTS.COLORS.NEON_GREEN, 0.8);
        panel.strokeRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 8);

        // Header Title
        this.add.text(width / 2, height / 2 - 170, 'DECRYPTION TERMINAL', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '18px',
            color: '#39ff14',
            fontWeight: 'bold',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.statusText = this.add.text(width / 2, height / 2 - 145, 'MEMORIZE CODE SEQUENCE', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#00f0ff'
        }).setOrigin(0.5);

        // Build 3x3 node grid for sequence inputs
        this.nodes = [];
        const startX = width / 2 - 90;
        const startY = height / 2 - 75;
        const gap = 90;

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const id = r * 3 + c;
                const nx = startX + c * gap;
                const ny = startY + r * gap;

                const nodeGfx = this.add.graphics();
                nodeGfx.fillStyle(0x111128, 0.9);
                nodeGfx.fillCircle(0, 0, 24);
                nodeGfx.lineStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.4);
                nodeGfx.strokeCircle(0, 0, 24);

                const label = this.add.text(0, 0, (id + 1).toString(), {
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '14px',
                    color: '#00f0ff',
                    fontWeight: 'bold'
                }).setOrigin(0.5);

                const container = this.add.container(nx, ny, [nodeGfx, label]);
                container.nodeId = id;
                container.gfx = nodeGfx;
                container.lbl = label;

                this.nodes.push(container);

                // Add interactive bounds
                const zone = this.add.circle(nx, ny, 26, 0, 0).setInteractive({ useHandCursor: true });
                zone.on('pointerdown', () => this.handleNodeClick(id));
            }
        }

        // Timer Bar
        this.timerGfx = this.add.graphics();

        // Generate random sequence
        this.generateSequence();

        // Show the sequence to the player
        this.gameState = 'SHOWING';
        this.showSequence();
    }

    generateSequence() {
        for (let i = 0; i < this.sequenceLength; i++) {
            // No consecutive duplicate nodes
            let nextVal = MathUtils.randomInt(0, 8);
            while (this.sequence.length > 0 && this.sequence[this.sequence.length - 1] === nextVal) {
                nextVal = MathUtils.randomInt(0, 8);
            }
            this.sequence.push(nextVal);
        }
    }

    showSequence() {
        let delay = 600;
        this.sequence.forEach((nodeId, index) => {
            this.time.delayedCall(delay, () => {
                if (this.gameState !== 'SHOWING') return;

                const node = this.nodes[nodeId];
                this.highlightNode(node, CONSTANTS.COLORS.NEON_GREEN, 300);
                if (window.audioSystem) window.audioSystem.playBlip(500 + index * 100, 0.08);

                // Start player phase after showing the last item
                if (index === this.sequence.length - 1) {
                    this.time.delayedCall(400, () => {
                        this.gameState = 'PLAYING';
                        this.statusText.setText('ENTER CODE SEQUENCE IN CORRECT ORDER');
                        this.statusText.setColor('#00f0ff');
                    });
                }
            });
            delay += 600;
        });
    }

    highlightNode(node, color, duration) {
        node.gfx.clear();
        node.gfx.fillStyle(color, 0.3);
        node.gfx.fillCircle(0, 0, 24);
        node.gfx.lineStyle(2.5, color, 1);
        node.gfx.strokeCircle(0, 0, 24);
        node.lbl.setColor('#ffffff');

        this.time.delayedCall(duration, () => {
            if (this.gameState === 'SUCCESS' || this.gameState === 'FAILED') return;
            node.gfx.clear();
            node.gfx.fillStyle(0x111128, 0.9);
            node.gfx.fillCircle(0, 0, 24);
            node.gfx.lineStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.4);
            node.gfx.strokeCircle(0, 0, 24);
            node.lbl.setColor('#00f0ff');
        });
    }

    handleNodeClick(id) {
        if (this.gameState !== 'PLAYING') return;

        const node = this.nodes[id];
        const expectedId = this.sequence[this.playerInput.length];

        this.playerInput.push(id);

        if (id === expectedId) {
            // Correct input
            this.highlightNode(node, CONSTANTS.COLORS.NEON_GREEN, 200);
            if (window.audioSystem) window.audioSystem.playBlip(700 + this.playerInput.length * 100, 0.05);

            if (this.playerInput.length === this.sequence.length) {
                this.handleSuccess();
            }
        } else {
            // Incorrect input
            this.highlightNode(node, CONSTANTS.COLORS.NEON_RED, 400);
            this.handleFailure();
        }
    }

    handleSuccess() {
        this.gameState = 'SUCCESS';
        this.statusText.setText('DECRYPTION COMPLETE // ACCESS GRANTED');
        this.statusText.setColor('#39ff14');
        if (window.audioSystem) window.audioSystem.playPickup();

        // Increment hacking count in SaveSystem
        window.saveSystem.incrementStat('totalHacks');

        this.time.delayedCall(1000, () => {
            this.scene.stop('HackingScene');
            if (this.parentScene && this.parentScene.onHackSuccess) {
                this.parentScene.onHackSuccess(this.terminalId, this.isBossTerminal);
            }
        });
    }

    handleFailure() {
        this.gameState = 'FAILED';
        this.statusText.setText('SYSTEM LOCKOUT // ACCESS DENIED');
        this.statusText.setColor('#ff1744');
        if (window.audioSystem) window.audioSystem.playDamage();

        this.time.delayedCall(1000, () => {
            this.scene.stop('HackingScene');
            if (this.parentScene && this.parentScene.onHackFailure) {
                this.parentScene.onHackFailure(this.terminalId);
            }
        });
    }

    update(time, delta) {
        if (this.gameState !== 'PLAYING') return;

        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.handleFailure();
        }

        // Draw timer bar
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;
        
        this.timerGfx.clear();
        
        // Background track
        this.timerGfx.fillStyle(0x221122, 0.8);
        this.timerGfx.fillRect(width / 2 - 150, height / 2 + 155, 300, 6);
        
        // Current fill
        const pct = this.timeLeft / this.timeLimit;
        const timerColor = pct > 0.5 ? CONSTANTS.COLORS.NEON_GREEN : pct > 0.25 ? CONSTANTS.COLORS.NEON_YELLOW : CONSTANTS.COLORS.NEON_RED;
        
        this.timerGfx.fillStyle(timerColor, 0.9);
        this.timerGfx.fillRect(width / 2 - 150, height / 2 + 155, 300 * pct, 6);
        this.timerGfx.lineStyle(1, timerColor, 0.4);
        this.timerGfx.strokeRect(width / 2 - 150, height / 2 + 155, 300, 6);
    }
}
