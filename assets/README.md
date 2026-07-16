# Asset Replacement Guide 🎨

This guide outlines how to replace the procedural shapes and audio synthesizer files in **Cyber Heist** with custom spritesheet drawings, sound clips, and ambient music files.

## 🖼️ Graphic Art Sprites

By default, the game draws vectors and circles directly onto the Phaser canvas. To transition to PNG image sprites:

1. **Preload sprites in `js/scenes/BootScene.js`**:
   ```javascript
   this.load.image('player', 'assets/sprites/player.png');
   this.load.image('guard', 'assets/sprites/guard.png');
   this.load.spritesheet('camera', 'assets/sprites/camera.png', { frameWidth: 32, frameHeight: 32 });
   this.load.image('keycard_red', 'assets/sprites/keycard_red.png');
   ```

2. **Update Entity Constructors**:
   Modify constructor classes inside `js/entities/` (e.g. [Player.js](file:///d:/Projects/Cyber%20Heist/js/entities/Player.js), [Guard.js](file:///d:/Projects/Cyber%20Heist/js/entities/Guard.js)) to replace:
   ```javascript
   // Old:
   this.sprite = scene.add.circle(x, y, radius, color, 1);
   // New:
   this.sprite = scene.physics.add.sprite(x, y, 'player');
   ```

## 🔊 Sound Effects & Music Loops

Audio in Cyber Heist is generated procedurally using the Web Audio API inside `js/systems/AudioSystem.js`. To replace this synthesizer with standard MP3/Ogg files:

1. **Preload Audio Assets** inside `BootScene.js`:
   ```javascript
   this.load.audio('bgm_menu', 'assets/audio/menu.mp3');
   this.load.audio('sfx_alarm', 'assets/audio/alarm.wav');
   ```

2. **Re-route `AudioSystem.js` triggers**:
   Instantiate Phaser sound controls instead of scheduling Web Audio context oscillators:
   ```javascript
   // Inside AudioSystem.js:
   playAlarm() {
       this.scene.sound.play('sfx_alarm', { volume: this.sfxVolume });
   }
   ```
