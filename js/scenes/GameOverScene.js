/**
 * GameOverScene.js — Heist failure screen
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.parentSceneKey = data.parentSceneKey;
        this.levelId = data.levelId;
        this.reason = data.reason || 'SYSTEM LOCKOUT';
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Play failure sound
        if (window.audioSystem) {
            window.audioSystem.stopMusic();
            window.audioSystem.playFailure();
        }

        // Increment death statistics
        window.saveSystem.incrementStat('totalDeaths');

        // Dark dim backdrop
        this.add.rectangle(width / 2, height / 2, width, height, 0x070000, 0.9);

        // Header Title
        const title = this.add.text(width / 2, height / 2 - 100, 'MISSION FAILED', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '42px',
            fontWeight: '900',
            color: '#ff1744',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Fail Reason
        this.add.text(width / 2, height / 2 - 45, `REASON: ${this.reason.toUpperCase()}`, {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Glowing anim
        this.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Options
        const options = [
            { text: 'REDEPLOY INFILTRATION UNIT', action: () => this.retryHeist() },
            { text: 'ABANDON OPERATIVE', action: () => this.quitToMenu() }
        ];

        let buttonY = height / 2 + 50;
        options.forEach(opt => {
            const btnContainer = this.add.container(width / 2, buttonY);

            const btnBg = this.add.rectangle(0, 0, 240, 38, 0x111128, 0.95);
            btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_RED, 0.5);

            const btnTxt = this.add.text(0, 0, opt.text, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '12px',
                color: '#ff1744',
                fontWeight: 'bold',
                letterSpacing: 1
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnTxt]);
            btnBg.setInteractive({ useHandCursor: true });

            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0xff1744, 0.15);
                btnBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_RED, 1);
                btnTxt.setColor('#ffffff');
                if (window.audioSystem) window.audioSystem.playBlip(500, 0.04);
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });

            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x111128, 0.95);
                btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_RED, 0.5);
                btnTxt.setColor('#ff1744');
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

            buttonY += 55;
        });
    }

    retryHeist() {
        this.scene.start('GameScene', { levelId: this.levelId });
    }

    quitToMenu() {
        this.scene.start('MenuScene');
    }
}
