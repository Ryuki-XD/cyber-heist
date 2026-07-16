/**
 * PauseScene.js — HUD pause menu overlay scene
 */
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data) {
        this.parentScene = data.parentScene;
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Dark dim backdrop
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);

        // Pause Menu frame panel
        const panel = this.add.graphics();
        panel.fillStyle(0x0a0a20, 0.95);
        panel.fillRoundedRect(width / 2 - 130, height / 2 - 150, 260, 300, 8);
        panel.lineStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.6);
        panel.strokeRoundedRect(width / 2 - 130, height / 2 - 150, 260, 300, 8);

        // Header Title
        this.add.text(width / 2, height / 2 - 110, 'HEIST PAUSED', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '20px',
            color: '#00f0ff',
            fontWeight: 'bold',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Options
        const options = [
            { text: 'RESUME CONNECTION', action: () => this.resumeGame() },
            { text: 'RESTART HEIST', action: () => this.restartGame() },
            { text: 'ABANDON MISSION', action: () => this.abortGame() }
        ];

        let buttonY = height / 2 - 40;
        options.forEach(opt => {
            const btnContainer = this.add.container(width / 2, buttonY);

            const btnBg = this.add.rectangle(0, 0, 200, 36, 0x111128, 0.85);
            btnBg.setStrokeStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.5);

            const btnTxt = this.add.text(0, 0, opt.text, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '12px',
                color: '#00f0ff',
                fontWeight: 'bold',
                letterSpacing: 1
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnTxt]);
            btnBg.setInteractive({ useHandCursor: true });

            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0xff00aa, 0.2);
                btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 1);
                btnTxt.setColor('#ffffff');
                if (window.audioSystem) window.audioSystem.playBlip(600, 0.04);
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });

            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x111128, 0.85);
                btnBg.setStrokeStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.5);
                btnTxt.setColor('#00f0ff');
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 100
                });
            });

            btnBg.on('pointerdown', () => {
                if (window.audioSystem) window.audioSystem.playPickup();
                opt.action();
            });

            buttonY += 50;
        });

        // Toggle pause on ESC key
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.scene.stop();
        this.scene.resume(this.parentScene.scene.key);
    }

    restartGame() {
        this.scene.stop();
        this.parentScene.scene.restart();
    }

    abortGame() {
        this.scene.stop();
        this.parentScene.scene.stop();
        this.scene.start('MenuScene');
    }
}
