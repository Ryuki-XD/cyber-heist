/**
 * SettingsScene.js — Game configuration settings menu
 */
class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        this.settings = window.saveSystem.loadSettings();

        // Title
        this.add.text(width / 2, 70, 'SYSTEM SETTINGS', {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '28px',
            fontWeight: '900',
            color: '#00f0ff',
            stroke: '#ff00aa',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Box border panel
        const borderGfx = this.add.graphics();
        borderGfx.lineStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.4);
        borderGfx.strokeRoundedRect(width / 2 - 250, 120, 500, 360, 6);
        borderGfx.fillStyle(0x0a0a20, 0.5);
        borderGfx.fillRoundedRect(width / 2 - 250, 120, 500, 360, 6);

        // Render setting options
        let startY = 160;

        // 1. Difficulty Setting
        this.add.text(width / 2 - 180, startY, 'DIFFICULTY LEVEL', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        const diffText = this.add.text(width / 2 + 100, startY, this.settings.difficulty, {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#39ff14',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const cycleDiffBtn = this.add.text(width / 2 + 180, startY, '[CHANGE]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        cycleDiffBtn.on('pointerdown', () => {
            if (window.audioSystem) window.audioSystem.playBlip(660, 0.05);
            const modes = ['EASY', 'NORMAL', 'HARD'];
            let idx = (modes.indexOf(this.settings.difficulty) + 1) % modes.length;
            this.settings.difficulty = modes[idx];
            diffText.setText(this.settings.difficulty);
            
            // Adjust text color based on difficulty
            if (this.settings.difficulty === 'EASY') diffText.setColor('#39ff14');
            else if (this.settings.difficulty === 'NORMAL') diffText.setColor('#ffea00');
            else diffText.setColor('#ff1744');
        });

        // Apply initial color
        if (this.settings.difficulty === 'EASY') diffText.setColor('#39ff14');
        else if (this.settings.difficulty === 'NORMAL') diffText.setColor('#ffea00');
        else diffText.setColor('#ff1744');

        // Divider
        startY += 50;

        // 2. Music Volume
        this.add.text(width / 2 - 180, startY, 'MUSIC VOLUME', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        const musicValText = this.add.text(width / 2 + 100, startY, Math.round(this.settings.musicVolume * 100) + '%', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const musicDecBtn = this.add.text(width / 2 + 50, startY, '[-]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const musicIncBtn = this.add.text(width / 2 + 150, startY, '[+]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicDecBtn.on('pointerdown', () => {
            this.settings.musicVolume = Math.max(0, parseFloat((this.settings.musicVolume - 0.1).toFixed(1)));
            musicValText.setText(Math.round(this.settings.musicVolume * 100) + '%');
            window.audioSystem.setMusicVolume(this.settings.musicVolume);
            if (window.audioSystem) window.audioSystem.playBlip(600, 0.05);
        });

        musicIncBtn.on('pointerdown', () => {
            this.settings.musicVolume = Math.min(1.0, parseFloat((this.settings.musicVolume + 0.1).toFixed(1)));
            musicValText.setText(Math.round(this.settings.musicVolume * 100) + '%');
            window.audioSystem.setMusicVolume(this.settings.musicVolume);
            if (window.audioSystem) window.audioSystem.playBlip(800, 0.05);
        });

        // Divider
        startY += 50;

        // 3. SFX Volume
        this.add.text(width / 2 - 180, startY, 'SFX VOLUME', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        const sfxValText = this.add.text(width / 2 + 100, startY, Math.round(this.settings.sfxVolume * 100) + '%', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const sfxDecBtn = this.add.text(width / 2 + 50, startY, '[-]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const sfxIncBtn = this.add.text(width / 2 + 150, startY, '[+]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        sfxDecBtn.on('pointerdown', () => {
            this.settings.sfxVolume = Math.max(0, parseFloat((this.settings.sfxVolume - 0.1).toFixed(1)));
            sfxValText.setText(Math.round(this.settings.sfxVolume * 100) + '%');
            window.audioSystem.setSfxVolume(this.settings.sfxVolume);
            if (window.audioSystem) window.audioSystem.playBlip(600, 0.05);
        });

        sfxIncBtn.on('pointerdown', () => {
            this.settings.sfxVolume = Math.min(1.0, parseFloat((this.settings.sfxVolume + 0.1).toFixed(1)));
            sfxValText.setText(Math.round(this.settings.sfxVolume * 100) + '%');
            window.audioSystem.setSfxVolume(this.settings.sfxVolume);
            if (window.audioSystem) window.audioSystem.playBlip(800, 0.05);
        });

        // Divider
        startY += 50;

        // 4. Touch Joysticks Setting
        this.add.text(width / 2 - 180, startY, 'MOBILE CONTROLS', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        const touchText = this.add.text(width / 2 + 100, startY, this.settings.touchControls ? 'ENABLED' : 'DISABLED', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: this.settings.touchControls ? '#39ff14' : '#ff1744'
        }).setOrigin(0.5);

        const toggleTouchBtn = this.add.text(width / 2 + 180, startY, '[TOGGLE]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        toggleTouchBtn.on('pointerdown', () => {
            if (window.audioSystem) window.audioSystem.playBlip(660, 0.05);
            this.settings.touchControls = !this.settings.touchControls;
            touchText.setText(this.settings.touchControls ? 'ENABLED' : 'DISABLED');
            touchText.setColor(this.settings.touchControls ? '#39ff14' : '#ff1744');
        });

        // Divider
        startY += 50;

        // 5. Diagnostics (Show FPS)
        this.add.text(width / 2 - 180, startY, 'SHOW SYSTEM FPS', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#aaaacc'
        }).setOrigin(0, 0.5);

        const fpsText = this.add.text(width / 2 + 100, startY, this.settings.showFPS ? 'YES' : 'NO', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: this.settings.showFPS ? '#39ff14' : '#ff1744'
        }).setOrigin(0.5);

        const toggleFpsBtn = this.add.text(width / 2 + 180, startY, '[TOGGLE]', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#00f0ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        toggleFpsBtn.on('pointerdown', () => {
            if (window.audioSystem) window.audioSystem.playBlip(660, 0.05);
            this.settings.showFPS = !this.settings.showFPS;
            fpsText.setText(this.settings.showFPS ? 'YES' : 'NO');
            fpsText.setColor(this.settings.showFPS ? '#39ff14' : '#ff1744');
        });

        // 6. Save & Exit
        const saveContainer = this.add.container(width / 2, 440);
        const saveBg = this.add.rectangle(0, 0, 180, 36, 0x111128, 0.9);
        saveBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.6);
        const saveTxt = this.add.text(0, 0, 'APPLY & RETURN', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '13px',
            color: '#39ff14',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        saveContainer.add([saveBg, saveTxt]);
        saveBg.setInteractive({ useHandCursor: true });

        saveBg.on('pointerover', () => {
            saveBg.setFillStyle(0x39ff14, 0.15);
            saveBg.setStrokeStyle(2, CONSTANTS.COLORS.NEON_GREEN, 1);
            saveTxt.setColor('#ffffff');
            if (window.audioSystem) window.audioSystem.playBlip(750, 0.04);
            this.tweens.add({
                targets: saveContainer,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        saveBg.on('pointerout', () => {
            saveBg.setFillStyle(0x111128, 0.9);
            saveBg.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.6);
            saveTxt.setColor('#39ff14');
            this.tweens.add({
                targets: saveContainer,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100
            });
        });

        saveBg.on('pointerdown', () => {
            window.saveSystem.saveSettings(this.settings);
            if (window.audioSystem) window.audioSystem.playPickup();
            this.scene.start('MenuScene');
        });
    }
}
