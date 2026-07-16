/**
 * BootScene.js — Game preloader and system initialization scene
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Cyberpunk terminal console log output during boot
        const bootText = this.add.text(width / 2, height / 2 - 100, '', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: '#00f0ff',
            align: 'center'
        }).setOrigin(0.5);

        const logs = [
            'CONNECTING TO NETWORK GATEWAY...',
            'BYPASSING INTRUSION DETECTION SYSTEMS...',
            'INJECTING IN-MEMORY ENCRYPTED EXECUTABLES...',
            'ESTABLISHING ANTIGRAVITY ENCRYPTED CHANNEL...',
            'INITIALIZING GRAPHICS ENGINE & SHADERS...',
            'LOADING SUB-SYSTEM CONTROLLERS...',
            'SECURITY CRACK STABLE. INITIALIZING CYBER HEIST.'
        ];

        let logIndex = 0;
        this.time.addEvent({
            delay: 350,
            repeat: logs.length - 1,
            callback: () => {
                bootText.setText(logs.slice(0, logIndex + 1).join('\n'));
                logIndex++;
            }
        });

        // Setup loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x111128, 0.8);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 + 50, 320, 16, 4);
        progressBox.lineStyle(1, 0x00f0ff, 0.3);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2 + 50, 320, 16, 4);

        const percentText = this.add.text(width / 2, height / 2 + 85, '0%', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#ff00aa'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00f0ff, 0.8);
            progressBar.fillRoundedRect(width / 2 - 156, height / 2 + 54, 312 * value, 8, 2);
        });

        this.load.on('complete', () => {
            // Give extra 500ms to admire the intro log printout
            this.time.delayedCall(2000, () => {
                progressBar.destroy();
                progressBox.destroy();
                percentText.destroy();
                bootText.destroy();
                this.scene.start('MenuScene');
            });
        });

        // Trigger loading (even if no external assets, Phaser needs something to start loader)
        // We load a dummy key or just wait for load complete event.
        this.load.image('dummy', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
}
