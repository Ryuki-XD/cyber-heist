/**
 * GameScene.js — Core stealth gameplay scene
 * Orchestrates level building, physics, player actions, AI loops, and systems.
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelId = data.levelId || 1;
        this.levelDef = LEVEL_DATA.find(lvl => lvl.id === this.levelId);
        
        const settings = window.saveSystem.loadSettings();
        this.difficulty = CONSTANTS.DIFFICULTY[settings.difficulty] || CONSTANTS.DIFFICULTY.NORMAL;
        this.useTouchControls = settings.touchControls;

        // Reset level state
        this.timeElapsed = 0;
        this.stealthRun = true;
        this.alarmCountdown = null;
        this.escapeActive = false;
        this.bossHackCount = 0;
        this.score = 0;
        this.isGameOver = false;

        // Active terminal tracking
        this.activeTerminal = null;
    }

    create() {
        // Start background music loop for gameplay
        if (window.audioSystem) {
            const musicType = this.levelDef.isBossLevel ? 'boss' : 'gameplay';
            window.audioSystem.startMusic(musicType);
        }

        // Initialize Level Builder
        const builder = new LevelBuilder(this);
        const built = builder.build(this.levelDef, this.difficulty);

        this.player = built.player;
        this.walls = built.walls;
        this.guards = built.guards;
        this.cameras = built.cameras;
        this.lasers = built.lasers;
        this.doors = built.doors;
        this.keycards = built.keycards;
        this.terminals = built.terminals;
        this.upgrades = built.upgrades;
        this.exitZone = built.exitZone;
        this.boss = built.boss;

        this.worldWidth = built.worldWidth;
        this.worldHeight = built.worldHeight;

        // Initialize Systems
        this.lightingSystem = new LightingSystem(this);
        this.particleSystem = new ParticleSystem(this);
        this.hudSystem = new HUDSystem(this);

        // Configure ambient light level
        this.lightingSystem.setAmbientDarkness(this.levelDef.ambientDarkness);

        // Add player light source
        this.lightingSystem.addLight({
            radius: 95,
            intensity: 1.0,
            follows: this.player.sprite,
            color: 0xffffff
        });

        // Add static light sources from level definition
        if (this.levelDef.lights) {
            this.levelDef.lights.forEach(lt => {
                this.lightingSystem.addLight({
                    x: lt.x * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2,
                    y: lt.y * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2,
                    radius: lt.radius,
                    intensity: 1.0,
                    color: 0x00f0ff,
                    flicker: lt.flicker || false,
                    flickerAmount: 6
                });
            });
        }

        // Camera Setup
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

        // Register Keyboards
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Register Overlap Detections
        this.physics.add.overlap(this.player.sprite, this.hitbox, () => {}); // dummy to allow manual checks

        // Virtual Touch Joystick & Buttons (for Mobile/Touch screens)
        if (this.useTouchControls) {
            this.setupVirtualControls();
        }
    }

    setupVirtualControls() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Draw Joystick base on the bottom-left corner
        this.joystickBase = this.add.circle(100, height - 100, 50, 0x111128, 0.6)
            .setScrollFactor(0).setDepth(1010).setStrokeStyle(2, CONSTANTS.COLORS.NEON_CYAN, 0.5);

        this.joystickKnob = this.add.circle(100, height - 100, 22, CONSTANTS.COLORS.NEON_CYAN, 0.8)
            .setScrollFactor(0).setDepth(1011);

        // Pointer handlers for touch dragging
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x < width / 2 && pointer.y > height / 2) {
                this.joystickActive = true;
                this.joystickCenter = { x: pointer.x, y: pointer.y };
                this.joystickBase.setPosition(pointer.x, pointer.y);
                this.joystickKnob.setPosition(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.joystickActive && this.joystickCenter) {
                const dx = pointer.x - this.joystickCenter.x;
                const dy = pointer.y - this.joystickCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 50;

                let vx = dx;
                let vy = dy;
                if (dist > maxDist) {
                    vx = (dx / dist) * maxDist;
                    vy = (dy / dist) * maxDist;
                }

                this.joystickKnob.setPosition(this.joystickCenter.x + vx, this.joystickCenter.y + vy);

                // Pass normalized velocity
                const normalX = vx / maxDist;
                const normalY = vy / maxDist;
                this.player.setTouchVelocity(normalX, normalY);
            }
        });

        this.input.on('pointerup', () => {
            if (this.joystickActive) {
                this.joystickActive = false;
                this.joystickKnob.setPosition(100, height - 100);
                this.joystickBase.setPosition(100, height - 100);
                this.player.setTouchVelocity(0, 0);
            }
        });

        // Add virtual Action Buttons on the bottom-right
        const actionBtnX = width - 85;
        const actionBtnY = height - 95;

        // Sprint Button (Shift)
        this.sprintBtn = this.add.circle(actionBtnX - 70, actionBtnY, 26, 0x111128, 0.7)
            .setScrollFactor(0).setDepth(1010).setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.6);
        this.sprintBtnText = this.add.text(actionBtnX - 70, actionBtnY, 'FAST', {
            fontFamily: 'monospace', fontSize: '10px', color: '#00f0ff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);

        this.sprintBtn.setInteractive();
        this.sprintBtn.on('pointerdown', () => {
            this.player.shiftKey.isDown = true;
            this.sprintBtn.setFillStyle(0xff00aa, 0.4);
            this.sprintBtn.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PINK, 1.0);
            this.sprintBtnText.setColor('#ffffff');
        });
        const releaseSprint = () => {
            this.player.shiftKey.isDown = false;
            this.sprintBtn.setFillStyle(0x111128, 0.7);
            this.sprintBtn.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_CYAN, 0.6);
            this.sprintBtnText.setColor('#00f0ff');
        };
        this.sprintBtn.on('pointerup', releaseSprint);
        this.sprintBtn.on('pointerout', releaseSprint);

        // Interact Button (E / Space)
        this.interactBtn = this.add.circle(actionBtnX, actionBtnY - 15, 30, 0x111128, 0.7)
            .setScrollFactor(0).setDepth(1010).setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.6);
        this.interactBtnText = this.add.text(actionBtnX, actionBtnY - 15, 'HACK', {
            fontFamily: 'monospace', fontSize: '11px', color: '#39ff14', fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);

        this.interactBtn.setInteractive();
        this.interactBtn.on('pointerdown', () => {
            this.player.interactKey.isDown = true;
            this.interactBtn.setFillStyle(0x39ff14, 0.3);
            this.interactBtn.setStrokeStyle(2, CONSTANTS.COLORS.NEON_GREEN, 1.0);
            this.interactBtnText.setColor('#ffffff');
        });
        const releaseInteract = () => {
            this.player.interactKey.isDown = false;
            this.interactBtn.setFillStyle(0x111128, 0.7);
            this.interactBtn.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_GREEN, 0.6);
            this.interactBtnText.setColor('#39ff14');
        };
        this.interactBtn.on('pointerup', releaseInteract);
        this.interactBtn.on('pointerout', releaseInteract);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        const dt = delta / 1000;
        this.timeElapsed += dt;

        // Handle Pause input
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.pause();
            this.scene.launch('PauseScene', { parentScene: this });
            return;
        }

        // Update player sprite controls
        this.player.update(dt);

        // Update guards FSM/Vision
        this.guards.forEach(g => g.update(dt, this.player));

        // Update boss FSM/Vision (if in level 5)
        if (this.boss && this.boss.active) {
            this.boss.update(dt, this.player);
        }

        // Update security cameras
        this.cameras.forEach(c => c.update(dt, this.player));

        // Update laser hazards pulse and handle collisions
        this.lasers.forEach(l => {
            l.update(dt);
            if (l.canDamage()) {
                const overlap = this.physics.overlap(this.player.sprite, l.hitbox);
                if (overlap) {
                    this.player.takeDamage(CONSTANTS.LASER.DAMAGE);
                }
            }
        });

        // Update data terminal particle streams
        this.terminals.forEach(t => t.update(dt));

        // Handle active overlay particles
        this.particleSystem.update(dt);

        // Update lighting rendering punch out
        this.lightingSystem.update();

        // ── Check Objective Overlaps ──
        this.checkCollisionsAndInteractions();

        // ── Escape Timer Sequence ──
        if (this.escapeActive && this.alarmCountdown !== null) {
            this.alarmCountdown -= dt;
            if (this.alarmCountdown <= 0) {
                this.alarmCountdown = 0;
                this.triggerGameOver('ALARM PROTOCOL LOCKED');
            }
        }

        // Update HUD
        const detected = this.guards.some(g => g.fsm.is('CHASE')) || this.cameras.some(c => c.alerted) || (this.boss && this.boss.fsm.is('CHASE'));
        
        if (detected && this.stealthRun) {
            this.stealthRun = false;
        }

        this.hudSystem.update({
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            energy: this.player.energy,
            maxEnergy: this.player.maxEnergy,
            keycards: this.player.keycards,
            upgrades: this.player.upgrades,
            objectives: this.getObjectivesStatus(),
            timer: this.escapeActive ? this.alarmCountdown : null,
            detected: detected,
            levelName: `SEC-0${this.levelId} // ${this.levelDef.name.toUpperCase()}`,
            player: this.player,
            guards: this.guards,
            walls: this.walls
        });

        // Check fail conditions
        if (this.player.health <= 0) {
            this.triggerGameOver('VITAL SIGN CRITICAL');
        }
    }

    checkCollisionsAndInteractions() {
        const px = this.player.x;
        const py = this.player.y;

        let nearInteractive = false;
        let promptMessage = '';

        // 1. Keycards Pickup overlap
        this.keycards.forEach(kc => {
            if (!kc.collected) {
                const dist = MathUtils.distance(px, py, kc.x, kc.y);
                if (dist < 20) {
                    kc.collect(this.player);
                    this.score += 150;
                }
            }
        });

        // 2. Upgrades Pickup overlap
        this.upgrades.forEach(up => {
            if (!up.collected) {
                const dist = MathUtils.distance(px, py, up.x, up.y);
                if (dist < 20) {
                    up.collect(this.player);
                }
            }
        });

        // 3. Doors interaction range
        this.doors.forEach(door => {
            if (!door.isOpen && door.isInRange(this.player)) {
                nearInteractive = true;
                if (door.color === 'hack') {
                    promptMessage = 'PRESS E TO HACK DOOR';
                    if (this.player.isInteracting() || (this.useTouchControls && this.player.interactKey.isDown)) {
                        this.launchHackGame('door_' + door.x + '_' + door.y, false);
                    }
                } else if (door.color !== 'none') {
                    promptMessage = `REQUIRES ${door.color.toUpperCase()} KEYCARD`;
                    if (this.player.isInteracting() || (this.useTouchControls && this.player.interactKey.isDown)) {
                        const status = door.tryOpen(this.player);
                        if (status === 'opened') {
                            this.score += 200;
                        }
                    }
                } else {
                    promptMessage = 'PRESS E TO OPEN DOOR';
                    if (this.player.isInteracting() || (this.useTouchControls && this.player.interactKey.isDown)) {
                        door.open();
                    }
                }
            }
        });

        // 4. Terminals interaction range
        this.terminals.forEach(term => {
            if (!term.hacked && term.isInRange(this.player)) {
                nearInteractive = true;
                promptMessage = 'PRESS E TO BYPASS GATEWAY';
                if (this.player.isInteracting() || (this.useTouchControls && this.player.interactKey.isDown)) {
                    this.launchHackGame(term.id, term.isBossTerminal);
                }
            }
        });

        // 5. Exit Zone completion
        if (this.exitZone) {
            const dist = MathUtils.distance(px, py, this.exitZone.x, this.exitZone.y);
            if (dist < 25) {
                if (this.areCoreObjectivesMet()) {
                    this.triggerVictory();
                } else {
                    nearInteractive = true;
                    promptMessage = 'OBJECTIVES INCOMPLETE';
                }
            }
        }

        // Show/hide prompt labels
        if (nearInteractive) {
            this.hudSystem.showPrompt(promptMessage);
        } else {
            this.hudSystem.hidePrompt();
        }
    }

    launchHackGame(terminalId, isBossTerminal) {
        // Prevent launching multiple hacks
        if (this.scene.isActive('HackingScene')) return;

        // Stagger/pause gameplay inputs
        this.scene.pause();
        this.scene.launch('HackingScene', {
            parentScene: this,
            terminalId: terminalId,
            difficulty: this.difficulty,
            isBossTerminal: isBossTerminal
        });
    }

    onHackSuccess(terminalId, isBossTerminal) {
        this.scene.resume(this.scene.key);

        if (isBossTerminal) {
            // Level 5 Boss mechanic
            this.bossHackCount++;
            const t = this.terminals.find(term => term.id === terminalId);
            if (t) t.hack();

            if (this.boss) {
                this.boss.takeHit();
            }

            this.score += 500;
        } else if (terminalId.startsWith('door_')) {
            // We hacked a door open
            const coords = terminalId.split('_');
            const dx = parseFloat(coords[1]);
            const dy = parseFloat(coords[2]);
            const door = this.doors.find(d => d.x === dx && d.y === dy);
            if (door) door.open();
            this.score += 300;
        } else {
            // We hacked a data/objective terminal
            const t = this.terminals.find(term => term.id === terminalId);
            if (t) {
                t.hack();
                this.score += 400;

                // Escape sequence check (Level 4/5)
                if (this.levelDef.escapeTimer && !this.escapeActive) {
                    this.escapeActive = true;
                    this.alarmCountdown = this.levelDef.escapeTimer * this.difficulty.escapeTimeMul;
                    if (window.audioSystem) window.audioSystem.playAlarm();
                }
            }
        }
    }

    onHackFailure(terminalId) {
        this.scene.resume(this.scene.key);
        // Sound or alarm alert on hack failure
        if (window.audioSystem) window.audioSystem.playAlarm();
        
        // Damage player
        this.player.takeDamage(15);

        // Alert nearby guards to search the terminal area
        this.guards.forEach(g => {
            const dist = MathUtils.distance(this.player.x, this.player.y, g.x, g.y);
            if (dist < 280) {
                g.alertToPosition(this.player.x, this.player.y);
            }
        });
    }

    areCoreObjectivesMet() {
        // All objectives check (except the exit/escape)
        const objectives = this.getObjectivesStatus();
        return objectives.every(obj => obj.id === 'escape' || obj.completed);
    }

    getObjectivesStatus() {
        const statuses = [];
        this.levelDef.objectives.forEach(obj => {
            let completed = false;

            if (obj.type === 'keycard') {
                completed = this.player.hasKeycard(obj.keyColor);
            } else if (obj.type === 'door') {
                completed = this.doors.some(d => d.color === 'red' && d.isOpen);
            } else if (obj.type === 'hack') {
                const t = this.terminals.find(term => term.id === obj.terminalId);
                completed = t ? t.hacked : false;
            } else if (obj.type === 'boss_hack') {
                completed = this.bossHackCount >= obj.count;
                statuses.push({
                    id: obj.id,
                    text: `Hack AI Mainframe nodes (${this.bossHackCount}/${obj.count})`,
                    completed: completed
                });
                return;
            } else if (obj.type === 'info') {
                completed = true;
            } else if (obj.type === 'exit') {
                // Exit is checked during overlap, not as pre-requisite
                completed = false;
            }

            statuses.push({
                id: obj.id,
                text: obj.text,
                completed: completed
            });
        });

        return statuses;
    }

    triggerGameOver(reason) {
        this.isGameOver = true;
        this.player.sprite.body.setVelocity(0, 0);
        this.scene.stop();
        this.scene.start('GameOverScene', {
            parentSceneKey: this.scene.key,
            levelId: this.levelId,
            reason: reason
        });
    }

    triggerVictory() {
        this.isGameOver = true;
        this.player.sprite.body.setVelocity(0, 0);

        // Calculate score additions: Time Bonus, Stealth Bonus
        let timeBonus = Math.max(0, 1000 - Math.round(this.timeElapsed) * 5);
        let stealthBonus = this.stealthRun ? 1500 : 0;
        this.score += timeBonus + stealthBonus;

        // Calculate rank S, A, B, C, D
        let rank = 'D';
        if (this.stealthRun && this.timeElapsed < 70) rank = 'S';
        else if (this.stealthRun) rank = 'A';
        else if (this.timeElapsed < 100) rank = 'B';
        else if (this.timeElapsed < 160) rank = 'C';

        this.scene.stop();
        this.scene.start('VictoryScene', {
            levelId: this.levelId,
            score: this.score,
            timeElapsed: this.timeElapsed,
            detected: !this.stealthRun,
            rank: rank
        });
    }

    destroy() {
        if (this.joystickBase) this.joystickBase.destroy();
        if (this.joystickKnob) this.joystickKnob.destroy();
        if (this.sprintBtn) this.sprintBtn.destroy();
        if (this.sprintBtnText) this.sprintBtnText.destroy();
        if (this.interactBtn) this.interactBtn.destroy();
        if (this.interactBtnText) this.interactBtnText.destroy();

        this.lightingSystem.destroy();
        this.particleSystem.destroy();
        this.hudSystem.destroy();
        
        this.guards.forEach(g => g.destroy());
        this.cameras.forEach(c => c.destroy());
        this.lasers.forEach(l => l.destroy());
        this.doors.forEach(d => d.destroy());
        this.keycards.forEach(k => k.destroy());
        this.terminals.forEach(t => t.destroy());
        this.upgrades.forEach(u => u.destroy());
        if (this.exitZone) this.exitZone.destroy();
        if (this.boss) this.boss.destroy();
    }
}
