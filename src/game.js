/**
 * Nacho el Maestro - Main Game Coordinator & Engine
 * Manages Pixi.js app, input, collision detection, game loop & states.
 */

class GameEngine {
  constructor() {
    this.app = null;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.score = 0;
    this.totalKills = 0;
    this.lives = 3;
    this.mode = "classic"; // "classic" or "practice"
    this.isRunning = false;
    this.isPaused = false;

    // Keys state tracking
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
      ctrl: false,
      justPressedLeft: false,
      justPressedRight: false,
      justPressedSpace: false,
      justPressedCtrl: false
    };

    this.initPixi();
    this.setupInput();
  }

  initPixi() {
    const canvasContainer = document.getElementById("game-canvas-container");

    // Initialize Pixi.js Application
    this.app = new PIXI.Application({
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      backgroundColor: 0x0B0C1E,
      resolution: 1,
      antialias: false,
      autoDensity: true
    });

    // Make canvas fill container with pixel-perfect aspect ratio
    const view = this.app.view;
    view.id = "game-canvas";
    canvasContainer.appendChild(view);

    // Create World Stage Layers
    this.stage = this.app.stage;

    // 1. Backgrounds
    this.stage.addChild(parallaxManager.container);
    // 2. World Entities
    this.worldContainer = new PIXI.Container();
    this.stage.addChild(this.worldContainer);
    // 3. Particles & VFX
    this.stage.addChild(particleSystem.container);

    // Handle Window Resize
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();

    // Start Pixi Ticker
    this.app.ticker.add(delta => this.gameLoop(delta / 60));
  }

  resizeCanvas() {
    const container = document.getElementById("arcade-screen");
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const targetRatio = 16 / 9;

    let canvasW = w;
    let canvasH = w / targetRatio;

    if (canvasH > h) {
      canvasH = h;
      canvasW = h * targetRatio;
    }

    const canvas = this.app.view;
    canvas.style.width = `${Math.floor(canvasW)}px`;
    canvas.style.height = `${Math.floor(canvasH)}px`;
  }

  setupInput() {
    window.addEventListener("keydown", e => {
      // Prevent browser scroll for game keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ControlLeft", "ControlRight"].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === "ArrowLeft") {
        if (!this.keys.left) this.keys.justPressedLeft = true;
        this.keys.left = true;
      }
      if (e.code === "ArrowRight") {
        if (!this.keys.right) this.keys.justPressedRight = true;
        this.keys.right = true;
      }
      if (e.code === "ArrowUp") this.keys.up = true;
      if (e.code === "ArrowDown") this.keys.down = true;
      if (e.code === "Space") {
        if (!this.keys.space) this.keys.justPressedSpace = true;
        this.keys.space = true;
      }
      if (e.code === "ControlLeft" || e.code === "ControlRight") {
        if (!this.keys.ctrl) this.keys.justPressedCtrl = true;
        this.keys.ctrl = true;
      }
    });

    window.addEventListener("keyup", e => {
      if (e.code === "ArrowLeft") this.keys.left = false;
      if (e.code === "ArrowRight") this.keys.right = false;
      if (e.code === "ArrowUp") this.keys.up = false;
      if (e.code === "ArrowDown") this.keys.down = false;
      if (e.code === "Space") this.keys.space = false;
      if (e.code === "ControlLeft" || e.code === "ControlRight") this.keys.ctrl = false;
    });

    // Initialize Mobile Touch Controls ONLY IF played on a mobile device
    if (this.isMobileDevice()) {
      this.setupMobileControls();
    }
  }

  isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTouchScreen = (navigator.maxTouchPoints > 1 && window.innerWidth <= 900);
    return isMobileUA || isTouchScreen;
  }

  setupMobileControls() {
    const mobileOverlay = document.getElementById("mobile-touch-controls");
    if (mobileOverlay) mobileOverlay.classList.remove("hidden");

    // Initialize Nipple.js Dynamic Joystick on the left
    if (window.nipplejs) {
      const zone = document.getElementById("joystick-zone");
      if (zone) {
        this.joystick = nipplejs.create({
          zone: zone,
          mode: "static",
          position: { left: "75px", bottom: "75px" },
          color: "#00F0FF",
          size: 100
        });

        this.joystick.on("move", (evt, data) => {
          if (!data || !data.angle) return;
          const deg = data.angle.degree;
          this.keys.left = false;
          this.keys.right = false;
          this.keys.up = false;
          this.keys.down = false;

          // Left
          if (deg >= 120 && deg <= 240) {
            if (!this.keys.left) this.keys.justPressedLeft = true;
            this.keys.left = true;
          }
          // Right
          if (deg <= 60 || deg >= 300) {
            if (!this.keys.right) this.keys.justPressedRight = true;
            this.keys.right = true;
          }
          // Up
          if (deg >= 30 && deg <= 150) {
            this.keys.up = true;
          }
          // Down
          if (deg >= 210 && deg <= 330) {
            this.keys.down = true;
          }
        });

        this.joystick.on("end", () => {
          this.keys.left = false;
          this.keys.right = false;
          this.keys.up = false;
          this.keys.down = false;
        });
      }
    }

    // Touch Action Buttons on the right
    const btnAttack = document.getElementById("btn-mobile-attack");
    if (btnAttack) {
      btnAttack.addEventListener("touchstart", e => {
        e.preventDefault();
        if (!this.keys.space) this.keys.justPressedSpace = true;
        this.keys.space = true;
      });
      btnAttack.addEventListener("touchend", e => {
        e.preventDefault();
        this.keys.space = false;
      });
    }

    const btnSpecial = document.getElementById("btn-mobile-special");
    if (btnSpecial) {
      btnSpecial.addEventListener("touchstart", e => {
        e.preventDefault();
        if (!this.keys.ctrl) this.keys.justPressedCtrl = true;
        this.keys.ctrl = true;
      });
      btnSpecial.addEventListener("touchend", e => {
        e.preventDefault();
        this.keys.ctrl = false;
      });
    }
  }

  clearJustPressed() {
    this.keys.justPressedLeft = false;
    this.keys.justPressedRight = false;
    this.keys.justPressedSpace = false;
    this.keys.justPressedCtrl = false;
  }

  startGame(mode = "classic") {
    this.mode = mode;
    this.lives = (mode === "classic") ? 3 : Infinity;
    this.score = 0;
    this.totalKills = 0;

    // Reset World
    this.clearWorld();

    // Spawn Nacho (Starting at Belt 0: White Belt)
    this.player = new NachoPlayer();
    this.player.setBelt(0);
    this.worldContainer.addChild(this.player.container);
    this.player.respawn(120, GAME_CONFIG.FLOOR_Y);

    // Start Level 1
    levelManager.startLevel(1);

    this.isRunning = true;
    this.isPaused = false;
  }

  restartGame() {
    uiManager.showScreen("game");
    this.startGame(this.mode);
  }

  clearWorld() {
    this.worldContainer.removeChildren();
    this.enemies = [];
    this.projectiles = [];
    if (levelManager.currentBoss) {
      levelManager.currentBoss = null;
    }
    this.player = null;
    particleSystem.clear();
  }

  advanceToNextLevel() {
    this.enemies.forEach(e => this.worldContainer.removeChild(e.container));
    this.projectiles.forEach(p => this.worldContainer.removeChild(p.container));
    this.enemies = [];
    this.projectiles = [];

    // Reset player position & state
    this.player.respawn(120, GAME_CONFIG.FLOOR_Y);

    levelManager.nextLevel(this.player);
  }

  gameLoop(dt) {
    if (!this.isRunning || this.isPaused) {
      this.clearJustPressed();
      return;
    }

    // Ensure player container is always active in stage
    if (this.player && !this.worldContainer.children.includes(this.player.container)) {
      this.worldContainer.addChild(this.player.container);
    }

    // 1. Update Player Input & State
    if (this.player) {
      this.player.handleInput(this.keys);
      this.player.update(dt);
    }

    // 2. Update Parallax Backgrounds
    const pVelX = this.player ? this.player.vx : 0;
    parallaxManager.update(pVelX);

    // 3. Update Level & Spawners
    levelManager.update(dt, this.enemies, this.projectiles, this.player);

    // Add new enemy sprites to container
    this.enemies.forEach(e => {
      if (!this.worldContainer.children.includes(e.container)) {
        this.worldContainer.addChild(e.container);
      }
    });

    // Add boss sprite to container if active
    if (levelManager.bossActive && levelManager.currentBoss) {
      const boss = levelManager.currentBoss;
      if (!this.worldContainer.children.includes(boss.container)) {
        this.worldContainer.addChild(boss.container);
      }
    }

    // 4. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this.projectiles);

      // Clean up dead removed enemies
      if (e.isDead && e.deathTimer <= 0) {
        this.worldContainer.removeChild(e.container);
        this.enemies.splice(i, 1);
        this.score += e.scoreValue;
        this.totalKills++;
        levelManager.registerKill();
      }
    }

    // 5. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!this.worldContainer.children.includes(p.container)) {
        this.worldContainer.addChild(p.container);
      }
      p.update(dt);

      if (p.isDead) {
        this.worldContainer.removeChild(p.container);
        this.projectiles.splice(i, 1);
      }
    }

    // 6. Handle All Hitbox Collisions
    this.handleCollisions();

    // 7. Update Particles & VFX
    particleSystem.update();

    // 8. Update UI / HUD
    uiManager.updateHUD(this.player, levelManager, this.score, this.lives, this.mode);

    // 9. Check Level Clear / Victory / Game Over
    if (levelManager.levelComplete && !levelManager.isFinalVictory) {
      // Show promotion modal
      levelManager.levelComplete = false; // Prevent repeated triggers
      const beltData = GAME_CONFIG.BELTS[this.player.beltIndex];
      uiManager.showLevelClear(beltData, this.score);
    } else if (levelManager.isFinalVictory) {
      levelManager.isFinalVictory = false;
      uiManager.showVictory(this.score, this.totalKills);
    }

    // Check Player Death
    if (this.player && this.player.isDead && this.player.stateTimer >= 1.5) {
      this.handlePlayerDeath();
    }

    this.clearJustPressed();
  }

  handlePlayerDeath() {
    if (this.mode === "classic") {
      this.lives--;
      if (this.lives <= 0) {
        this.isRunning = false;
        uiManager.showGameOver(this.score);
        return;
      } else {
        // Lost a life, but still has lives remaining!
        // Pause game and show the alert modal requested by the user
        this.isPaused = true;
        uiManager.showLifeLost(this.lives);
        return;
      }
    }

    // Practice Mode (Infinite lives): Respawn player in place
    this.player.respawn(120, GAME_CONFIG.FLOOR_Y);
  }

  resumeAfterLifeLost() {
    this.isPaused = false;

    // Clear all current wave enemies and projectiles
    this.enemies.forEach(e => {
      if (this.worldContainer.children.includes(e.container)) {
        this.worldContainer.removeChild(e.container);
      }
    });
    this.projectiles.forEach(p => {
      if (this.worldContainer.children.includes(p.container)) {
        this.worldContainer.removeChild(p.container);
      }
    });
    if (levelManager.currentBoss && this.worldContainer.children.includes(levelManager.currentBoss.container)) {
      this.worldContainer.removeChild(levelManager.currentBoss.container);
    }
    this.enemies = [];
    this.projectiles = [];
    particleSystem.clear();

    // Ensure player is attached to worldContainer and completely respawned
    if (!this.player) {
      this.player = new NachoPlayer();
      this.worldContainer.addChild(this.player.container);
    } else if (!this.worldContainer.children.includes(this.player.container)) {
      this.worldContainer.addChild(this.player.container);
    }
    this.player.respawn(120, GAME_CONFIG.FLOOR_Y);

    // Restart the level from the very beginning!
    levelManager.startLevel(levelManager.currentLevelIndex);
  }

  // --- COLLISION SYSTEM (AABB) ---
  handleCollisions() {
    if (!this.player || this.player.state === "DEAD") return;

    const pHurtbox = this.player.getHurtbox();
    const pAttackHb = this.player.attackHitbox;
    const isSpecial = (this.player.state === "SPECIAL");

    // 1. SPECIAL ATTACK (KIHAP TORNADO - FULL SCREEN AREA EFFECT)
    if (isSpecial) {
      // Hit all enemies on screen
      this.enemies.forEach(e => {
        if (!e.isDead) {
          const knockback = (e.x >= this.player.x) ? 8 : -8;
          e.takeHit(GAME_CONFIG.PLAYER.SPECIAL_DAMAGE, knockback);
        }
      });
      // Hit boss if active
      if (levelManager.bossActive && levelManager.currentBoss && !levelManager.currentBoss.isDead) {
        const boss = levelManager.currentBoss;
        boss.takeHit(GAME_CONFIG.PLAYER.SPECIAL_DAMAGE * 0.6, (boss.x >= this.player.x) ? 4 : -4);
      }
    }

    // 2. NORMAL ATTACK HITBOX VS ENEMIES
    if (pAttackHb && !this.player.hasHitEnemyThisAttack) {
      // Check vs regular enemies
      for (let e of this.enemies) {
        if (e.isDead) continue;
        const eHb = e.getHitbox();

        if (this.checkAABB(pAttackHb, eHb)) {
          // Stance validation:
          // Crawlers can ONLY be hit by low sweep (pAttackHb.isLow)
          if (e.isLow && !pAttackHb.isLow) {
            continue; // Kick flew right over him!
          }
          // Wraiths can ONLY be hit by aerial attacks (pAttackHb.isAir or Nacho in air)
          if (e.isFlying && !pAttackHb.isAir) {
            continue; // Ground kick missed the flying ghost!
          }

          // Successful hit!
          const knockback = (this.player.facing > 0) ? 6 : -6;
          e.takeHit(pAttackHb.damage, knockback);
          this.player.hasHitEnemyThisAttack = true;
          break; // Hit one enemy per strike
        }
      }

      // Check vs Boss
      if (!this.player.hasHitEnemyThisAttack && levelManager.bossActive && levelManager.currentBoss && !levelManager.currentBoss.isDead) {
        const boss = levelManager.currentBoss;
        const bHb = boss.getHitbox();
        if (this.checkAABB(pAttackHb, bHb)) {
          const knockback = (this.player.facing > 0) ? 3 : -3;
          boss.takeHit(pAttackHb.damage, knockback);
          this.player.hasHitEnemyThisAttack = true;
        }
      }
    }

    // 3. ENEMY CONTACT / GRAB VS NACHO
    for (let e of this.enemies) {
      if (e.isDead) continue;
      const eHb = e.getHitbox();

      if (this.checkAABB(pHurtbox, eHb)) {
        if (e.type === "walker") {
          // Walker Zombie Grab mechanic
          if (!e.isGrabbing && !this.player.grabbedBy.includes(e) && this.player.invulnerableTimer <= 0) {
            e.isGrabbing = true;
            this.player.grabbedBy.push(e);
            retroAudio.playZombieGrab();
            particleSystem.spawnComicText(this.player.x, this.player.y - 48, "¡AGARRADO!", 0xE74C3C);
          }
        } else if (e.type === "crawler" || e.type === "wraith") {
          // Deal direct contact damage
          const dir = (this.player.x >= e.x) ? 1 : -1;
          this.player.takeDamage(e.damage, dir);
        }
      }
    }

    // 4. PROJECTILE VS NACHO
    for (let p of this.projectiles) {
      if (p.isDead) continue;
      const projHb = p.getHitbox();

      if (this.checkAABB(pHurtbox, projHb)) {
        // High projectiles can be ducked by crouching!
        if (p.isHigh && (this.player.state === "CROUCH" || this.player.state === "ATTACK_CROUCH")) {
          // Successfully ducked underneath projectile!
          continue;
        }
        // Low projectiles can be jumped over!
        if (!p.isHigh && !this.player.isGrounded && this.player.y < GAME_CONFIG.FLOOR_Y - 20) {
          // Successfully leaped over projectile!
          continue;
        }

        p.isDead = true;
        this.player.takeDamage(p.damage, p.dir);
        particleSystem.spawnHitSparks(p.x, p.y, false);
      }
    }

    // 5. BOSS ATTACK VS NACHO
    if (levelManager.bossActive && levelManager.currentBoss && !levelManager.currentBoss.isDead) {
      const boss = levelManager.currentBoss;
      const bAttackHb = boss.getAttackHitbox();
      if (bAttackHb && this.checkAABB(pHurtbox, bAttackHb)) {
        const dir = (this.player.x >= boss.x) ? 1 : -1;
        this.player.takeDamage(bAttackHb.damage, dir);
      }
    }
  }

  // AABB Overlap test
  checkAABB(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }
}

// Global Game Engine Instance
window.gameEngine = null;
window.addEventListener("DOMContentLoaded", () => {
  window.gameEngine = new GameEngine();
});
