/**
 * Nacho el Maestro - Entity Engine & State Machine
 * Implements Nacho (FSM), Enemies (Walkers, Crawlers, Wraiths, Casters), Projectiles & Bosses.
 */

// ===================================================
// NACHO PLAYER CLASS (FINITE STATE MACHINE)
// ===================================================
class NachoPlayer {
  constructor() {
    this.container = new PIXI.Container();
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 1.0); // Anchor at bottom center (feet)
    this.container.addChild(this.sprite);

    // Physics & Position
    this.x = 120;
    this.y = GAME_CONFIG.FLOOR_Y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1: Right, -1: Left
    this.isGrounded = true;

    // FSM State
    this.state = "IDLE"; // IDLE, WALK, CROUCH, JUMP, ATTACK_STAND, ATTACK_CROUCH, ATTACK_JUMP, SPECIAL, HURT, DEAD
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;

    // Stats & Belt
    this.maxHp = GAME_CONFIG.PLAYER.MAX_HP;
    this.hp = this.maxHp;
    this.beltIndex = 0;
    this.beltTextures = pixelArt.generateNachoTextures(this.beltIndex);

    // Attack & Cooldown
    this.isAttacking = false;
    this.attackHitbox = null;
    this.hasHitEnemyThisAttack = false;
    this.specialCooldown = 0; // In seconds (max 10)
    this.specialMaxCooldown = GAME_CONFIG.PLAYER.SPECIAL_COOLDOWN;

    // Grabbed / Grab Mechanic (NES Kung-Fu style)
    this.grabbedBy = [];
    this.grabEscapeMeter = 0;

    // Invulnerability
    this.invulnerableTimer = 0;
    this.isDead = false;

    this.updateSprite();
  }

  setBelt(index) {
    this.beltIndex = Math.min(index, GAME_CONFIG.BELTS.length - 1);
    this.beltTextures = pixelArt.generateNachoTextures(this.beltIndex);
    this.updateSprite();
  }

  respawn(x = 120, y = GAME_CONFIG.FLOOR_Y) {
    this.hp = this.maxHp;
    this.isDead = false;
    this.state = "IDLE";
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.isAttacking = false;
    this.attackHitbox = null;
    this.hasHitEnemyThisAttack = false;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.isGrounded = true;
    this.grabbedBy = [];
    this.grabEscapeMeter = 0;
    this.invulnerableTimer = 2.5;
    this.sprite.alpha = 1.0;
    this.sprite.visible = true;
    this.container.visible = true;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scale.x = this.facing;
    this.updateSprite();
  }

  changeState(newState) {
    if (this.state === "DEAD" && newState !== "IDLE") return;
    if (this.state === newState) return;

    this.state = newState;
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;

    // Handle state transitions
    if (newState.startsWith("ATTACK_")) {
      this.isAttacking = true;
      this.hasHitEnemyThisAttack = false;
      retroAudio.playWhoosh();
    } else if (newState !== "SPECIAL") {
      this.isAttacking = false;
      this.attackHitbox = null;
    }

    if (newState === "CROUCH") {
      retroAudio.playCrouch();
    }

    this.updateSprite();
  }

  handleInput(keys) {
    if (this.state === "DEAD" || this.state === "HURT") return;

    // Handle Grab Escape (Rapidly pressing arrows or space to break free)
    if (this.grabbedBy.length > 0) {
      if (keys.justPressedLeft || keys.justPressedRight || keys.justPressedSpace) {
        this.grabEscapeMeter += 25;
        particleSystem.spawnDust(this.x, this.y);
        if (this.grabEscapeMeter >= 50) {
          // Break free!
          this.breakGrab();
        }
      }
      return; // Limited movement while grabbed
    }

    // Special Attack (Ctrl)
    if (keys.justPressedCtrl && this.specialCooldown <= 0 && this.state !== "SPECIAL") {
      this.triggerSpecial();
      return;
    }

    if (this.state === "SPECIAL") return;

    // Normal Attacks (Space)
    if (keys.justPressedSpace && !this.isAttacking) {
      if (!this.isGrounded) {
        this.changeState("ATTACK_JUMP");
      } else if (keys.down) {
        this.changeState("ATTACK_CROUCH");
      } else {
        this.changeState("ATTACK_STAND");
      }
      return;
    }

    // Don't interrupt standing attack until finished
    if (this.isAttacking && (this.state === "ATTACK_STAND" || this.state === "ATTACK_CROUCH")) {
      return;
    }

    // Jumping & Movement
    if (this.isGrounded) {
      if (keys.up) {
        this.vy = GAME_CONFIG.PLAYER.JUMP_FORCE;
        this.isGrounded = false;
        this.changeState("JUMP");
        retroAudio.playJump();
        particleSystem.spawnDust(this.x, this.y);
      } else if (keys.down) {
        this.changeState("CROUCH");
      } else if (keys.left) {
        this.facing = -1;
        this.vx = -GAME_CONFIG.PLAYER.SPEED_X;
        this.changeState("WALK");
      } else if (keys.right) {
        this.facing = 1;
        this.vx = GAME_CONFIG.PLAYER.SPEED_X;
        this.changeState("WALK");
      } else {
        this.vx = 0;
        this.changeState("IDLE");
      }
    } else {
      // Mid-air horizontal steering
      if (keys.left) {
        this.vx = -GAME_CONFIG.PLAYER.SPEED_X * 0.85;
        this.facing = -1;
      } else if (keys.right) {
        this.vx = GAME_CONFIG.PLAYER.SPEED_X * 0.85;
        this.facing = 1;
      }
    }
  }

  triggerSpecial() {
    this.changeState("SPECIAL");
    this.specialCooldown = this.specialMaxCooldown;
    this.invulnerableTimer = 1.6;
    retroAudio.playKihap();
    particleSystem.spawnKihapWave(this.x, this.y - 24);
  }

  breakGrab() {
    this.grabbedBy.forEach(z => {
      z.isGrabbing = false;
      z.takeHit(30, this.facing * 4);
    });
    this.grabbedBy = [];
    this.grabEscapeMeter = 0;
    this.changeState("ATTACK_STAND");
  }

  takeDamage(amount, knockbackDir = 0) {
    if (this.invulnerableTimer > 0 || this.state === "DEAD") return;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = GAME_CONFIG.PLAYER.INVULNERABLE_TIME;
    retroAudio.playPlayerHurt();
    particleSystem.spawnHitSparks(this.x, this.y - 24, false);

    if (this.hp <= 0) {
      this.die();
    } else {
      this.changeState("HURT");
      this.vx = knockbackDir * 2.2;
      this.vy = -2.5;
      this.isGrounded = false;
    }
  }

  die() {
    this.hp = 0;
    this.isDead = true;
    this.changeState("DEAD");
    retroAudio.playGameOver();
  }

  update(dt) {
    this.stateTimer += dt;
    this.animTimer += dt;

    // Update Special Cooldown
    if (this.specialCooldown > 0) {
      const prevCd = this.specialCooldown;
      this.specialCooldown = Math.max(0, this.specialCooldown - dt);
      if (prevCd > 0 && this.specialCooldown === 0) {
        retroAudio.playSpecialReady();
      }
    }

    // Update Invulnerability
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.sprite.alpha = (Math.floor(this.invulnerableTimer * 20) % 2 === 0) ? 0.4 : 1.0;
    } else {
      this.sprite.alpha = 1.0;
    }

    // Handle Grab Health Drain
    if (this.grabbedBy.length > 0) {
      const drain = GAME_CONFIG.ENEMY_TYPES.walker.grabDrainRate * this.grabbedBy.length * dt;
      this.hp = Math.max(0, this.hp - drain);
      if (this.hp <= 0) this.die();
    }

    // Physics & Gravity
    if (!this.isGrounded) {
      this.vy += GAME_CONFIG.GRAVITY;
      this.y += this.vy;

      if (this.y >= GAME_CONFIG.FLOOR_Y) {
        this.y = GAME_CONFIG.FLOOR_Y;
        this.vy = 0;
        this.isGrounded = true;
        particleSystem.spawnDust(this.x, this.y);

        if (this.state === "JUMP" || this.state === "ATTACK_JUMP" || this.state === "HURT") {
          this.changeState("IDLE");
        }
      }
    }

    this.x += this.vx;
    // Keep Nacho in screen bounds
    this.x = Math.max(20, Math.min(GAME_CONFIG.CANVAS_WIDTH - 20, this.x));

    // Handle State-Specific Timers
    if (this.state === "ATTACK_STAND" || this.state === "ATTACK_CROUCH") {
      this.vx = 0; // Rooted during ground attack
      if (this.stateTimer >= GAME_CONFIG.PLAYER.ATTACK_DURATION) {
        this.changeState(this.state === "ATTACK_CROUCH" ? "CROUCH" : "IDLE");
      }
    } else if (this.state === "ATTACK_JUMP") {
      if (this.isGrounded) {
        this.changeState("IDLE");
      }
    } else if (this.state === "SPECIAL") {
      this.vx = 0;
      if (this.stateTimer >= 0.6) {
        this.changeState("IDLE");
      }
    } else if (this.state === "HURT") {
      if (this.stateTimer >= 0.35 && this.isGrounded) {
        this.changeState("IDLE");
      }
    }

    // Calculate Attack Hitbox
    this.updateHitbox();

    // Sprite Animation Cycling
    this.updateAnimation();
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scale.x = this.facing;
  }

  updateHitbox() {
    if (!this.isAttacking) {
      this.attackHitbox = null;
      return;
    }

    const dir = this.facing;
    if (this.state === "ATTACK_STAND") {
      const hb = GAME_CONFIG.PLAYER.STAND_HITBOX;
      this.attackHitbox = {
        x: this.x + (dir > 0 ? hb.x : -hb.x - hb.width),
        y: this.y + hb.y,
        width: hb.width,
        height: hb.height,
        damage: GAME_CONFIG.PLAYER.STAND_KICK_DAMAGE,
        isLow: false,
        isAir: false
      };
    } else if (this.state === "ATTACK_CROUCH") {
      const hb = GAME_CONFIG.PLAYER.CROUCH_HITBOX;
      this.attackHitbox = {
        x: this.x + (dir > 0 ? hb.x : -hb.x - hb.width),
        y: this.y + hb.y,
        width: hb.width,
        height: hb.height,
        damage: GAME_CONFIG.PLAYER.CROUCH_KICK_DAMAGE,
        isLow: true,
        isAir: false
      };
    } else if (this.state === "ATTACK_JUMP") {
      const hb = GAME_CONFIG.PLAYER.JUMP_HITBOX;
      this.attackHitbox = {
        x: this.x + (dir > 0 ? hb.x : -hb.x - hb.width),
        y: this.y + hb.y,
        width: hb.width,
        height: hb.height,
        damage: GAME_CONFIG.PLAYER.JUMP_KICK_DAMAGE,
        isLow: false,
        isAir: true
      };
    }
  }

  // Get Body Hurtbox for receiving damage
  getHurtbox() {
    const isCrouching = (this.state === "CROUCH" || this.state === "ATTACK_CROUCH");
    const h = isCrouching ? GAME_CONFIG.PLAYER.CROUCH_HEIGHT : GAME_CONFIG.PLAYER.HEIGHT;
    return {
      x: this.x - 12,
      y: this.y - h,
      width: 24,
      height: h
    };
  }

  updateAnimation() {
    const frameSpeed = (this.state === "WALK") ? 0.12 : 0.18;
    if (this.animTimer >= frameSpeed) {
      this.animTimer = 0;
      this.animFrame++;
    }
    this.updateSprite();
  }

  updateSprite() {
    let key = "idle";
    let frames = this.beltTextures.idle;

    if (this.state === "WALK") {
      key = "walk";
      frames = this.beltTextures.walk;
    } else if (this.state === "CROUCH") {
      key = "crouch";
      frames = this.beltTextures.crouch;
    } else if (this.state === "JUMP") {
      key = "jump";
      frames = this.beltTextures.jump;
    } else if (this.state === "ATTACK_STAND") {
      key = "attack_stand";
      frames = this.beltTextures.attack_stand;
    } else if (this.state === "ATTACK_CROUCH") {
      key = "attack_crouch";
      frames = this.beltTextures.attack_crouch;
    } else if (this.state === "ATTACK_JUMP") {
      key = "attack_jump";
      frames = this.beltTextures.attack_jump;
    } else if (this.state === "SPECIAL") {
      key = "special";
      frames = this.beltTextures.special;
    } else if (this.state === "HURT") {
      key = "hurt";
      frames = this.beltTextures.hurt;
    } else if (this.state === "DEAD") {
      key = "dead";
      frames = this.beltTextures.dead;
    }

    if (frames && frames.length > 0) {
      const idx = this.animFrame % frames.length;
      this.sprite.texture = frames[idx];
    }
  }
}

// ===================================================
// BASE ENEMY CLASS
// ===================================================
class BaseEnemy {
  constructor(type, spawnSide) {
    this.type = type;
    this.container = new PIXI.Container();
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 1.0);
    this.container.addChild(this.sprite);

    this.spawnSide = spawnSide; // "left" or "right"
    this.x = (spawnSide === "left") ? -20 : GAME_CONFIG.CANVAS_WIDTH + 20;
    this.y = GAME_CONFIG.FLOOR_Y;
    this.facing = (spawnSide === "left") ? 1 : -1;

    const stats = GAME_CONFIG.ENEMY_TYPES[type];
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.scoreValue = stats.scoreValue;
    this.width = stats.width;
    this.height = stats.height;

    this.isDead = false;
    this.deathTimer = 0;
    this.animTimer = 0;
    this.animFrame = 0;
    this.hurtTimer = 0;
    this.isGrabbing = false;

    this.textures = pixelArt.generateEnemyTextures()[type];
  }

  takeHit(damage, knockback = 0) {
    if (this.isDead) return;
    this.hp -= damage;
    this.hurtTimer = 0.2;
    this.x += knockback;
    retroAudio.playHit(this.hp <= 0);

    if (this.hp <= 0) {
      this.isDead = true;
      this.deathTimer = 0.4;
      particleSystem.spawnHitSparks(this.x, this.y - this.height / 2, true);
      particleSystem.spawnComicText(this.x, this.y - this.height, `+${this.scoreValue}`, 0x2ECC71);
    } else {
      particleSystem.spawnHitSparks(this.x, this.y - this.height / 2, false);
    }
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  update(dt, player) {
    this.animTimer += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    if (this.isDead) {
      this.deathTimer -= dt;
      this.sprite.alpha = Math.max(0, this.deathTimer / 0.4);
      if (this.textures.dead && this.textures.dead[0]) {
        this.sprite.texture = this.textures.dead[0];
      }
      return;
    }

    // Approach Nacho
    if (!this.isGrabbing) {
      const dx = player.x - this.x;
      this.facing = (dx >= 0) ? 1 : -1;
      this.x += this.facing * this.speed;
    }

    // Flash white/red when hurt
    this.sprite.tint = (this.hurtTimer > 0) ? 0xFF5555 : 0xFFFFFF;

    // Sprite position & facing
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scale.x = this.facing;
  }
}

// 1. Basic Walker Zombie
class WalkerZombie extends BaseEnemy {
  constructor(spawnSide) {
    super("walker", spawnSide);
  }

  update(dt, player) {
    super.update(dt, player);
    if (this.isDead) return;

    if (this.isGrabbing) {
      // Clinging to Nacho
      this.x = player.x + (this.facing > 0 ? -14 : 14);
      this.sprite.x = this.x;
      if (this.textures.grab && this.textures.grab[0]) {
        this.sprite.texture = this.textures.grab[0];
      }
    } else {
      if (this.animTimer >= 0.16) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % this.textures.walk.length;
        this.sprite.texture = this.textures.walk[this.animFrame];
      }
    }
  }
}

// 2. Crawler Zombie (Low ground creeping zombie)
class CrawlerZombie extends BaseEnemy {
  constructor(spawnSide) {
    super("crawler", spawnSide);
    this.isLow = true;
  }

  update(dt, player) {
    super.update(dt, player);
    if (this.isDead) return;

    if (this.animTimer >= 0.14) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % this.textures.crawl.length;
      this.sprite.texture = this.textures.crawl[this.animFrame];
    }
  }
}

// 3. Flying Wraith (Banshee / Specter)
class WraithEnemy extends BaseEnemy {
  constructor(spawnSide) {
    super("wraith", spawnSide);
    this.isFlying = true;
    this.y = GAME_CONFIG.FLOOR_Y - 50; // Fly at jump/head level
    this.flyTimer = Math.random() * Math.PI * 2;
  }

  update(dt, player) {
    super.update(dt, player);
    if (this.isDead) return;

    this.flyTimer += dt * 3;
    this.y = (GAME_CONFIG.FLOOR_Y - 50) + Math.sin(this.flyTimer) * 16;
    this.sprite.y = this.y;

    if (this.animTimer >= 0.16) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % this.textures.fly.length;
      this.sprite.texture = this.textures.fly[this.animFrame];
    }
  }
}

// 4. Caster Enemy (Shaman)
class CasterEnemy extends BaseEnemy {
  constructor(spawnSide) {
    super("caster", spawnSide);
    this.shootTimer = 1.5;
    this.isCasting = false;
  }

  update(dt, player, projectiles) {
    super.update(dt, player);
    if (this.isDead) return;

    const dist = Math.abs(player.x - this.x);

    // Stop and shoot when within range
    if (dist < 180) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = GAME_CONFIG.ENEMY_TYPES.caster.shootInterval;
        this.castProjectile(player, projectiles);
      }
      if (this.textures.cast && this.textures.cast[0] && this.shootTimer > 2.2) {
        this.sprite.texture = this.textures.cast[0];
      } else if (this.textures.idle) {
        const idx = Math.floor(this.animTimer * 6) % this.textures.idle.length;
        this.sprite.texture = this.textures.idle[idx];
      }
    } else {
      // Advance toward player
      this.x += this.facing * this.speed;
      if (this.textures.idle) {
        const idx = Math.floor(this.animTimer * 6) % this.textures.idle.length;
        this.sprite.texture = this.textures.idle[idx];
      }
    }
  }

  castProjectile(player, projectiles) {
    retroAudio.playShoot();
    // High or low projectile
    const isHigh = Math.random() > 0.5;
    const projY = isHigh ? (GAME_CONFIG.FLOOR_Y - 32) : (GAME_CONFIG.FLOOR_Y - 10);
    projectiles.push(new Projectile(this.x, projY, this.facing, "dark", isHigh));
  }
}

// ===================================================
// PROJECTILE CLASS
// ===================================================
class Projectile {
  constructor(x, y, dir, type = "dark", isHigh = true) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = 3.2;
    this.damage = 15;
    this.isHigh = isHigh;
    this.isDead = false;

    this.container = new PIXI.Container();
    const vfx = pixelArt.generateVFXTextures();
    const tex = (type === "fire") ? vfx.projectile_fire : (type === "ice") ? vfx.projectile_ice : vfx.projectile_dark;
    this.sprite = new PIXI.Sprite(tex);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  getHitbox() {
    return {
      x: this.x - 6,
      y: this.y - 6,
      width: 12,
      height: 12
    };
  }

  update(dt) {
    this.x += this.dir * this.speed;
    this.sprite.x = this.x;
    this.sprite.rotation += 0.2;

    // Out of bounds
    if (this.x < -30 || this.x > GAME_CONFIG.CANVAS_WIDTH + 30) {
      this.isDead = true;
    }
  }
}

// ===================================================
// ZONE BOSS CLASS (TITANS OF TAEKWONDO CHALLENGE)
// ===================================================
class ZoneBoss {
  constructor(bossConfig) {
    this.config = bossConfig;
    this.id = bossConfig.id;
    this.name = bossConfig.name;
    this.title = bossConfig.title;
    this.maxHp = bossConfig.maxHp;
    this.hp = bossConfig.maxHp;
    this.speed = bossConfig.speed;
    this.damage = bossConfig.attackDamage;

    this.container = new PIXI.Container();
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 1.0);
    this.container.addChild(this.sprite);

    this.x = GAME_CONFIG.CANVAS_WIDTH + 40;
    this.y = GAME_CONFIG.FLOOR_Y;
    this.facing = -1;
    this.width = 46;
    this.height = 60;

    this.state = "ENTER"; // ENTER, IDLE, ATTACK, RECOVER, DEAD
    this.stateTimer = 0;
    this.attackCooldown = 2.5;
    this.hurtTimer = 0;
    this.isDead = false;

    this.textures = pixelArt.generateBossTextures()[this.id];
  }

  takeHit(damage, knockback = 0) {
    if (this.isDead || this.state === "ENTER") return;
    this.hp -= damage;
    this.hurtTimer = 0.2;
    this.x += knockback * 0.5; // Boss has high poise
    retroAudio.playHeavyHit();
    particleSystem.spawnHitSparks(this.x, this.y - 30, true);

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.hp = 0;
    this.isDead = true;
    this.state = "DEAD";
    this.stateTimer = 0;
    particleSystem.spawnComicText(this.x, this.y - 45, "¡VICTORIA!", 0xF1C40F);
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  getAttackHitbox() {
    if (this.state !== "ATTACK" || this.stateTimer < 0.2 || this.stateTimer > 0.5) return null;
    return {
      x: this.x + (this.facing > 0 ? 10 : -42),
      y: this.y - 42,
      width: 34,
      height: 36,
      damage: this.damage
    };
  }

  update(dt, player, projectiles) {
    this.stateTimer += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    if (this.isDead) {
      this.sprite.alpha = Math.max(0, 1.0 - this.stateTimer / 1.5);
      return;
    }

    const dx = player.x - this.x;
    this.facing = (dx >= 0) ? 1 : -1;

    if (this.state === "ENTER") {
      this.x -= this.speed * 0.8;
      if (this.x <= GAME_CONFIG.CANVAS_WIDTH - 80) {
        this.state = "IDLE";
        this.stateTimer = 0;
      }
    } else if (this.state === "IDLE") {
      // Stalk Nacho
      const dist = Math.abs(dx);
      if (dist > 45) {
        this.x += this.facing * this.speed;
      }

      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0) {
        this.state = "ATTACK";
        this.stateTimer = 0;
        this.attackCooldown = 2.2 + Math.random() * 0.8;
        retroAudio.playWhoosh();
      }
    } else if (this.state === "ATTACK") {
      // Wind up and heavy strike
      if (this.stateTimer >= 0.6) {
        this.state = "RECOVER";
        this.stateTimer = 0;
      }
    } else if (this.state === "RECOVER") {
      // Vulnerable recovery pause
      if (this.stateTimer >= 0.5) {
        this.state = "IDLE";
        this.stateTimer = 0;
      }
    }

    // Animation & Tint
    this.sprite.tint = (this.hurtTimer > 0) ? 0xFF5555 : 0xFFFFFF;
    if (this.textures) {
      if (this.state === "ATTACK" && this.textures.attack && this.textures.attack[0]) {
        this.sprite.texture = this.textures.attack[0];
      } else if (this.textures.idle && this.textures.idle.length > 0) {
        const idx = Math.floor(this.stateTimer * 5) % this.textures.idle.length;
        this.sprite.texture = this.textures.idle[idx];
      }
    }

    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scale.x = this.facing;
  }
}
