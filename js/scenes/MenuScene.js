/**
 * MenuScene.js — Animated Main Menu scene with settings and high score display
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Start background music loop
        if (window.audioSystem) {
            window.audioSystem.startMusic('menu');
        }

        // Draw background grid
        this.gridGfx = this.add.graphics();
        this.particles = [];

        // Title text with glow & glitch effect
        const titleText = this.add.text(width / 2, 120, 'CYBER HEIST', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '56px',
            fontWeight: '900',
            color: '#00f0ff',
            stroke: '#ff00aa',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Subtitle
        const subTitle = this.add.text(width / 2, 175, 'STEALTH INFILTRATION SYSTEM', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#ff00aa',
            letterSpacing: 4
        }).setOrigin(0.5);

        // Animate title shadow pulse
        this.tweens.add({
            targets: titleText,
            scale: 1.03,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add glitch effect every few seconds
        this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                this.tweens.add({
                    targets: titleText,
                    x: width / 2 + (Math.random() - 0.5) * 8,
                    y: 120 + (Math.random() - 0.5) * 8,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        titleText.setPosition(width / 2, 120);
                    }
                });
            }
        });

        // Interactive Buttons
        const buttons = [
            { text: 'START NEW HEIST', scene: 'LevelSelectScene', data: { reset: true } },
            { text: 'CONTINUE MISSION', scene: 'LevelSelectScene', checkContinue: true },
            { text: 'SYSTEM SETTINGS', scene: 'SettingsScene' },
            { text: 'ACHIEVEMENTS', scene: 'VictoryScene', data: { viewAchievementsOnly: true } }
        ];

        let buttonY = 240;
        buttons.forEach(btn => {
            const hasSave = window.saveSystem.loadGame().completedLevels.length > 0;
            if (btn.checkContinue && !hasSave) return; // skip continue button if no save

            const btnContainer = this.add.container(width / 2, buttonY);
            
            const btnBg = this.add.rectangle(0, 0, 260, 36, 0x111128, 0.85);
            btnBg.setStrokeStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.5);
            
            const btnTxt = this.add.text(0, 0, btn.text, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '14px',
                color: '#00f0ff',
                fontWeight: 'bold',
                letterSpacing: 2
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnTxt]);

            // Interactive handlers
            btnBg.setInteractive({ useHandCursor: true });
            
            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0xff00aa, 0.2);
                btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 1);
                btnTxt.setColor('#ffffff');
                if (window.audioSystem) window.audioSystem.playBlip(660, 0.05);
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
                
                if (btn.data && btn.data.reset) {
                    window.saveSystem.resetAll();
                }

                this.scene.start(btn.scene, btn.data || {});
            });

            buttonY += 50;
        });

        // Add a scanline animation
        this.scanlineY = 0;

        // Footer version info
        this.add.text(width / 2, height - 20, 'SECURE CONNECT v3.90 // MIT LICENSE // ANTIGRAVITY ENGINE', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '9px',
            color: '#444466'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        const dt = delta / 1000;
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Draw scrolling background grids and neon stripes
        this.gridGfx.clear();
        this.gridGfx.lineStyle(1, 0x00f0ff, 0.04);

        const gridSize = 40;
        const scrollSpeed = 15;
        const offset = (time * 0.001 * scrollSpeed) % gridSize;

        for (let x = offset; x < width; x += gridSize) {
            this.gridGfx.lineBetween(x, 0, x, height);
        }
        for (let y = offset; y < height; y += gridSize) {
            this.gridGfx.lineBetween(0, y, width, y);
        }

        // Draw animated dust particles
        if (Math.random() < 0.05 && this.particles.length < 30) {
            this.particles.push({
                x: Math.random() * width,
                y: height + 10,
                speed: 10 + Math.random() * 30,
                size: 1 + Math.random() * 2,
                alpha: 0.1 + Math.random() * 0.4
            });
        }

        this.particles.forEach((p, idx) => {
            p.y -= p.speed * dt;
            this.gridGfx.fillStyle(CONSTANTS.COLORS.NEON_CYAN, p.alpha);
            this.gridGfx.fillCircle(p.x, p.y, p.size);

            if (p.y < -10) {
                this.particles.splice(idx, 1);
            }
        });
    }
}
