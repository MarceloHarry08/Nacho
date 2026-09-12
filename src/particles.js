/**
 * Nacho el Maestro - Particle & Visual Effects System
 * Manages impact sparks, dust, comic popups, shockwaves, and weather effects.
 */

class ParticleSystem {
  constructor() {
    this.container = new PIXI.Container();
    this.particles = [];
    this.weatherParticles = [];
    this.popups = [];
    this.currentBiome = 1;
  }

  setBiome(biomeIndex) {
    this.currentBiome = biomeIndex;
    // Clear old weather particles
    this.weatherParticles.forEach(p => this.container.removeChild(p.sprite));
    this.weatherParticles = [];

    // Initialize biome-specific weather particles
    const count = 40;
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      if (biomeIndex === 1) {
        // Acid rain streak
        g.lineStyle(1, 0x00F0FF, 0.4);
        g.moveTo(0, 0);
        g.lineTo(-2, 6);
      } else if (biomeIndex === 2) {
        // Swamp spores
        g.beginFill(0x2ECC71, 0.6);
        g.drawCircle(0, 0, 1.5);
        g.endFill();
      } else if (biomeIndex === 3) {
        // Snow flakes
        g.beginFill(0xFFFFFF, 0.7);
        g.drawCircle(0, 0, 1.8);
        g.endFill();
      } else if (biomeIndex === 4) {
        // Floating lava embers
        g.beginFill(0xE67E22, 0.8);
        g.drawRect(0, 0, 2, 2);
        g.endFill();
      } else if (biomeIndex === 5) {
        // Dark dragon ki embers
        g.beginFill(0x9B59B6, 0.7);
        g.drawCircle(0, 0, 2);
        g.endFill();
      }

      g.x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
      g.y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;

      const pData = {
        sprite: g,
        vx: (biomeIndex === 3) ? (Math.random() - 0.5) * 1.5 : (biomeIndex === 1) ? -1 : (Math.random() - 0.5) * 0.8,
        vy: (biomeIndex === 1) ? 5 + Math.random() * 3 : (biomeIndex === 4) ? -0.8 - Math.random() * 0.8 : 0.8 + Math.random() * 0.8,
        sway: Math.random() * Math.PI * 2
      };

      this.container.addChild(g);
      this.weatherParticles.push(pData);
    }
  }

  // Spawn Hit Sparks on impact
  spawnHitSparks(x, y, isCritical = false) {
    const vfx = pixelArt.generateVFXTextures();
    const count = isCritical ? 8 : 4;

    for (let i = 0; i < count; i++) {
      const spr = new PIXI.Sprite(vfx.hit_spark);
      spr.anchor.set(0.5);
      spr.x = x;
      spr.y = y;
      spr.scale.set(isCritical ? 0.9 : 0.6);

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 3.5;

      this.container.addChild(spr);
      this.particles.push({
        sprite: spr,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: 0.05,
        rotation: (Math.random() - 0.5) * 0.3
      });
    }

    // Comic popup text ("POW!", "KIHAP!", "HIT!")
    this.spawnComicText(x, y - 10, isCritical ? "¡KIHAP!" : "POW!");
  }

  // Spawn Dust puff when landing or executing low sweep
  spawnDust(x, y) {
    const vfx = pixelArt.generateVFXTextures();
    for (let i = 0; i < 3; i++) {
      const spr = new PIXI.Sprite(vfx.dust);
      spr.anchor.set(0.5);
      spr.x = x + (Math.random() - 0.5) * 12;
      spr.y = y;
      this.container.addChild(spr);
      this.particles.push({
        sprite: spr,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.6 - Math.random() * 0.8,
        alpha: 0.8,
        decay: 0.04
      });
    }
  }

  // Spawn Kihap Shockwave Ring
  spawnKihapWave(x, y) {
    const vfx = pixelArt.generateVFXTextures();
    const spr = new PIXI.Sprite(vfx.kihap_shockwave);
    spr.anchor.set(0.5);
    spr.x = x;
    spr.y = y;
    spr.scale.set(0.4);
    this.container.addChild(spr);

    this.particles.push({
      sprite: spr,
      vx: 0,
      vy: 0,
      scaleSpeed: 0.14,
      alpha: 1.0,
      decay: 0.035
    });

    this.spawnComicText(x, y - 25, "¡TORNADO KIHAP!", 0xF1C40F);
  }

  // Spawn Arcade Popups ("POW!", "¡KIHAP!", score +100)
  spawnComicText(x, y, text, color = 0xFFFFFF) {
    const style = new PIXI.TextStyle({
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 10,
      fontWeight: "bold",
      fill: color,
      stroke: "#000000",
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowDistance: 2
    });

    const txt = new PIXI.Text(text, style);
    txt.anchor.set(0.5);
    txt.x = Math.max(40, Math.min(GAME_CONFIG.CANVAS_WIDTH - 40, x));
    txt.y = y;
    this.container.addChild(txt);

    this.popups.push({
      sprite: txt,
      vy: -1.2,
      alpha: 1.0,
      decay: 0.035
    });
  }

  update() {
    // 1. Update weather particles
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    this.weatherParticles.forEach(p => {
      p.sway += 0.04;
      p.sprite.x += p.vx + Math.sin(p.sway) * 0.3;
      p.sprite.y += p.vy;

      if (p.sprite.y > h + 10) {
        p.sprite.y = -10;
        p.sprite.x = Math.random() * w;
      } else if (p.sprite.y < -10) {
        p.sprite.y = h + 10;
        p.sprite.x = Math.random() * w;
      }
      if (p.sprite.x > w + 10) p.sprite.x = -10;
      else if (p.sprite.x < -10) p.sprite.x = w + 10;
    });

    // 2. Update burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      p.alpha -= p.decay;
      p.sprite.alpha = Math.max(0, p.alpha);

      if (p.rotation) p.sprite.rotation += p.rotation;
      if (p.scaleSpeed) {
        p.sprite.scale.x += p.scaleSpeed;
        p.sprite.scale.y += p.scaleSpeed;
      }

      if (p.alpha <= 0) {
        this.container.removeChild(p.sprite);
        this.particles.splice(i, 1);
      }
    }

    // 3. Update text popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.sprite.y += pop.vy;
      pop.alpha -= pop.decay;
      pop.sprite.alpha = Math.max(0, pop.alpha);

      if (pop.alpha <= 0) {
        this.container.removeChild(pop.sprite);
        this.popups.splice(i, 1);
      }
    }
  }

  clear() {
    this.particles.forEach(p => this.container.removeChild(p.sprite));
    this.popups.forEach(p => this.container.removeChild(p.sprite));
    this.particles = [];
    this.popups = [];
  }
}

// Global Particle System
window.particleSystem = new ParticleSystem();
