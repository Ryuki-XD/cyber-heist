/**
 * VictoryScene.js — Heist success stats display and achievement logs
 */
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.levelId = data.levelId;
        this.score = data.score || 0;
        this.timeElapsed = data.timeElapsed || 0;
        this.detected = data.detected !== undefined ? data.detected : false;
        this.rank = data.rank || 'C';
        this.viewAchievementsOnly = data.viewAchievementsOnly || false;
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        if (this.viewAchievementsOnly) {
            this.createAchievementsView(width, height);
            return;
        }

        // Play success audio
        if (window.audioSystem) {
            window.audioSystem.stopMusic();
            window.audioSystem.playSuccess();
        }

        // Save progress & check achievements
        const achievementTracker = new AchievementSystem(this, window.saveSystem);
        const saved = window.saveSystem.completeLevel(this.levelId, this.score, this.timeElapsed, this.detected);
        
        // Count objectives to check if all terminal data was collected
        const levelDef = LEVEL_DATA.find(lvl => lvl.id === this.levelId);
        const dataTerminals = levelDef ? levelDef.terminals.filter(t => t.id.startsWith('data')) : [];
        
        // Achievement updates
        achievementTracker.checkLevelAchievements({
            levelId: this.levelId,
            time: this.timeElapsed,
            detected: this.detected,
            damageTaken: this.scene.get('GameScene')?.player?.damageTaken || 0,
            alarmsTriggered: this.detected ? 1 : 0,
            allDataCollected: true, // simple fallback
            healthRemaining: this.scene.get('GameScene')?.player?.health || 100
        });

        // Dark dim green backdrop
        this.add.rectangle(width / 2, height / 2, width, height, 0x000700, 0.9);

        // Header Title
        const title = this.add.text(width / 2, 80, 'HEIST SUCCESSFUL', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '36px',
            fontWeight: '900',
            color: '#39ff14',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Pulsing animation
        this.tweens.add({
            targets: title,
            alpha: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Rank Display
        this.add.text(width / 2 - 120, 180, 'RUN ASSESSMENT RATING', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '13px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        this.add.text(width / 2 + 100, 180, `RANK ${this.rank}`, {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '22px',
            fontWeight: '900',
            color: this.rank === 'S' || this.rank === 'A' ? '#39ff14' : '#00f0ff'
        }).setOrigin(0.5);

        // Stat logs list
        const stats = [
            { label: 'DECRYPTED SECTOR', val: `SEC-0${this.levelId}` },
            { label: 'ACQUIRED METRICS', val: `${this.score} CREDITS` },
            { label: 'CONNECTION DURATION', val: `${Math.round(this.timeElapsed)} SECONDS` },
            { label: 'STEALTH COVER STATUS', val: this.detected ? '⚠ DETECTED' : '✓ GHOST RUN' }
        ];

        let statY = 225;
        stats.forEach(st => {
            this.add.text(width / 2 - 120, statY, st.label, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '11px',
                color: '#666688'
            }).setOrigin(0, 0.5);

            this.add.text(width / 2 + 100, statY, st.val, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '12px',
                color: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            statY += 30;
        });

        // Navigation Buttons
        const nextLevelUnlocked = this.levelId < 5 && window.saveSystem.isLevelUnlocked(this.levelId + 1);

        const options = [];
        if (nextLevelUnlocked) {
            options.push({ text: 'ACCESS NEXT SECTOR', action: () => this.nextHeist() });
        }
        options.push({ text: 'DISCONNECT SESSION (MAIN)', action: () => this.quitToMenu() });

        let buttonY = 385;
        options.forEach(opt => {
            const btnContainer = this.add.container(width / 2, buttonY);

            const btnBg = this.add.rectangle(0, 0, 260, 36, 0x111128, 0.95);
            btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.5);

            const btnTxt = this.add.text(0, 0, opt.text, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '12px',
                color: '#39ff14',
                fontWeight: 'bold',
                letterSpacing: 1
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnTxt]);
            btnBg.setInteractive({ useHandCursor: true });

            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x39ff14, 0.15);
                btnBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_GREEN, 1);
                btnTxt.setColor('#ffffff');
                if (window.audioSystem) window.audioSystem.playBlip(750, 0.04);
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });

            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x111128, 0.95);
                btnBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.5);
                btnTxt.setColor('#39ff14');
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
    }

    nextHeist() {
        this.scene.start('GameScene', { levelId: this.levelId + 1 });
    }

    quitToMenu() {
        this.scene.start('MenuScene');
    }

    // ── Dedicated Achievements Log View ──
    createAchievementsView(width, height) {
        // Overlay title
        this.add.text(width / 2, 50, 'GRID LOG ACHIEVEMENT LOG', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '24px',
            fontWeight: '900',
            color: '#00f0ff',
            stroke: '#ff00aa',
            strokeThickness: 1
        }).setOrigin(0.5);

        const tracker = new AchievementSystem(this, window.saveSystem);
        const achievementsList = tracker.getAll();

        // Let's build a scrollable layout or a multi-column display grid.
        // We have 12 achievements. We can display them in a grid of 4x3 cells.
        const cols = 3;
        const startX = width / 2 - 220;
        const startY = 120;
        const gapX = 220;
        const gapY = 90;

        achievementsList.forEach((ach, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            const ax = startX + c * gapX;
            const ay = startY + r * gapY;

            const card = this.add.container(ax, ay);

            const cardBg = this.add.rectangle(0, 0, 200, 75, 0x111128, ach.unlocked ? 0.9 : 0.4);
            const borderCol = ach.unlocked ? CONSTANTS.COLORS.NEON_GREEN : 0x333344;
            cardBg.setStrokeStyle(1.5, borderCol, 0.7);

            // Icon
            const iconTxt = this.add.text(-80, -18, ach.icon, {
                fontSize: '20px'
            }).setOrigin(0.5);

            // Title
            const titleTxt = this.add.text(-55, -20, ach.name, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '11px',
                color: ach.unlocked ? '#39ff14' : '#666677',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);

            // Desc
            const descTxt = this.add.text(-80, 10, ach.description, {
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '9px',
                color: ach.unlocked ? '#aaaacc' : '#555566',
                wordWrap: { width: 170 }
            }).setOrigin(0, 0.5);

            card.add([cardBg, iconTxt, titleTxt, descTxt]);
        });

        // Close button
        const closeContainer = this.add.container(width / 2, 500);
        const closeBg = this.add.rectangle(0, 0, 180, 36, 0x111128, 0.95);
        closeBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 0.6);
        const closeTxt = this.add.text(0, 0, 'RETURN TO MAIN', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#ff00aa',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        closeContainer.add([closeBg, closeTxt]);
        closeBg.setInteractive({ useHandCursor: true });

        closeBg.on('pointerover', () => {
            closeBg.setFillStyle(0xff00aa, 0.15);
            closeBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_PINK, 1.0);
            closeTxt.setColor('#ffffff');
            if (window.audioSystem) window.audioSystem.playBlip(600, 0.04);
            this.tweens.add({
                targets: closeContainer,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        closeBg.on('pointerout', () => {
            closeBg.setFillStyle(0x111128, 0.95);
            closeBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 0.6);
            closeTxt.setColor('#ff00aa');
            this.tweens.add({
                targets: closeContainer,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100
            });
        });

        closeBg.on('pointerdown', () => {
            if (window.audioSystem) window.audioSystem.playPickup();
            this.scene.start('MenuScene');
        });
    }
}
