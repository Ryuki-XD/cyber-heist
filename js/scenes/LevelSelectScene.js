/**
 * LevelSelectScene.js — Main level selection terminal screen
 */
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;
        const saveData = window.saveSystem.loadGame();

        // Screen title
        this.add.text(width / 2, 50, 'SECTOR GATEWAY ACCESS', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '28px',
            fontWeight: '900',
            color: '#00f0ff',
            stroke: '#ff00aa',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 85, 'DECRYPT PROTOCOL LAYERS TO ACCESS INFILTRATION SITES', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '11px',
            color: '#666688',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Lay out levels in a horizontal/vertical grid. Since we have 5 levels:
        // We can place them in a 3x2 grid, centering the last one.
        const gridPos = [
            { x: width / 2 - 200, y: 180 },
            { x: width / 2,       y: 180 },
            { x: width / 2 + 200, y: 180 },
            { x: width / 2 - 100, y: 330 },
            { x: width / 2 + 100, y: 330 }
        ];

        LEVEL_DATA.forEach((lvl, idx) => {
            const pos = gridPos[idx];
            const unlocked = saveData.unlockedLevels.includes(lvl.id);
            const highscore = saveData.highScores[lvl.id];

            const card = this.add.container(pos.x, pos.y);

            // Card panel base
            const cardBg = this.add.rectangle(0, 0, 180, 110, 0x111128, unlocked ? 0.9 : 0.65);
            const borderColor = unlocked ? CONSTANTS.COLORS.NEON_CYAN : 0x333344;
            cardBg.setStrokeStyle(1.5, borderColor, 0.7);

            // Locked icon or details
            if (!unlocked) {
                const lockTxt = this.add.text(0, -10, '🔒 LOCKED', {
                    fontFamily: '"Orbitron", sans-serif',
                    fontSize: '14px',
                    color: '#ff1744',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
                
                const decTxt = this.add.text(0, 15, 'ENCRYPTED CHANNEL', {
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '9px',
                    color: '#555566'
                }).setOrigin(0.5);

                card.add([cardBg, lockTxt, decTxt]);
            } else {
                // Title
                const titleTxt = this.add.text(0, -32, `SEC-0${lvl.id}`, {
                    fontFamily: '"Orbitron", sans-serif',
                    fontSize: '14px',
                    color: '#00f0ff',
                    fontWeight: '900'
                }).setOrigin(0.5);

                // Name
                const nameTxt = this.add.text(0, -12, lvl.name, {
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '12px',
                    color: '#ffffff',
                    fontWeight: 'bold'
                }).setOrigin(0.5);

                // High score info
                let recordTxt = 'AWAITING BREACH';
                let rankTxt = 'NOT CLEARED';
                if (highscore) {
                    recordTxt = `${highscore.time}s | ${highscore.score} PTS`;
                    rankTxt = `RANK [${highscore.rank}]`;
                }

                const scoreTxt = this.add.text(0, 12, recordTxt, {
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '9px',
                    color: '#aaaacc'
                }).setOrigin(0.5);

                const statsTxt = this.add.text(0, 28, rankTxt, {
                    fontFamily: '"Orbitron", sans-serif',
                    fontSize: '10px',
                    color: highscore ? '#ff00aa' : '#555577',
                    fontWeight: 'bold'
                }).setOrigin(0.5);

                card.add([cardBg, titleTxt, nameTxt, scoreTxt, statsTxt]);

                // Interactions
                cardBg.setInteractive({ useHandCursor: true });

                cardBg.on('pointerover', () => {
                    cardBg.setFillStyle(0x00f0ff, 0.1);
                    cardBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_PINK, 1.0);
                    titleTxt.setColor('#ff00aa');
                    if (window.audioSystem) window.audioSystem.playBlip(700, 0.05);
                    this.tweens.add({
                        targets: card,
                        scaleX: 1.05,
                        scaleY: 1.05,
                        duration: 100
                    });
                });

                cardBg.on('pointerout', () => {
                    cardBg.setFillStyle(0x111128, 0.9);
                    cardBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.7);
                    titleTxt.setColor('#00f0ff');
                    this.tweens.add({
                        targets: card,
                        scaleX: 1.0,
                        scaleY: 1.0,
                        duration: 100
                    });
                });

                cardBg.on('pointerdown', () => {
                    if (window.audioSystem) window.audioSystem.playPickup();
                    this.scene.start('GameScene', { levelId: lvl.id });
                });
            }
        });

        // 7. Return to main menu button
        const returnContainer = this.add.container(width / 2, 490);
        const returnBg = this.add.rectangle(0, 0, 180, 36, 0x111128, 0.9);
        returnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 0.6);
        const returnTxt = this.add.text(0, 0, 'RETURN TO LOGON', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '13px',
            color: '#ff00aa',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        returnContainer.add([returnBg, returnTxt]);
        returnBg.setInteractive({ useHandCursor: true });

        returnBg.on('pointerover', () => {
            returnBg.setFillStyle(0xff00aa, 0.15);
            returnBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_PINK, 1.0);
            returnTxt.setColor('#ffffff');
            if (window.audioSystem) window.audioSystem.playBlip(600, 0.04);
            this.tweens.add({
                targets: returnContainer,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        returnBg.on('pointerout', () => {
            returnBg.setFillStyle(0x111128, 0.9);
            returnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 0.6);
            returnTxt.setColor('#ff00aa');
            this.tweens.add({
                targets: returnContainer,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100
            });
        });

        returnBg.on('pointerdown', () => {
            if (window.audioSystem) window.audioSystem.playPickup();
            this.scene.start('MenuScene');
        });
    }
}
