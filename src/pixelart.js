/**
 * Nacho el Maestro - 16-Bit Pixel Art Procedural Generator
 * Generates arcade-quality sprite sheets and textures using HTML5 Canvas.
 */

class PixelArtGenerator {
  constructor() {
    this.textures = {};
  }

  // Helper to create an offscreen canvas
  createCanvas(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // Convert canvas to Pixi Texture
  toTexture(canvas) {
    return PIXI.Texture.from(canvas);
  }

  // ==========================================
  // NACHO SPRITES (WITH DYNAMIC BELT COLORS)
  // ==========================================
  generateNachoTextures(beltIndex = 0) {
    const beltData = GAME_CONFIG.BELTS[beltIndex] || GAME_CONFIG.BELTS[0];
    const beltColor = beltData.color;
    const beltDark = beltData.darkColor;
    const beltAccent = beltData.accent;

    const key = `nacho_belt_${beltIndex}`;
    if (this.textures[key]) return this.textures[key];

    const w = 48;
    const h = 48;

    const drawDobok = (ctx, ox, oy, pose, frame = 0) => {
      // Skin palette
      const skin = "#FAD7A0";
      const skinShadow = "#E59866";
      const hairColor = "#17202A";
      const hairHighlight = "#2C3E50";
      const dobokWhite = "#FFFFFF";
      const dobokShade = "#BDC3C7";
      const dobokTrim = "#2C3E50"; // Dark collar trim
      const shoeColor = "#34495E";

      // 1. Shadow beneath character
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(ox + 20, oy + 44, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (pose === "idle") {
        const bob = Math.sin(frame * Math.PI / 2) * 1.5;
        const by = oy + bob;

        // Feet & Lower Legs
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 12, by + 40, 5, 4);
        ctx.fillRect(ox + 24, by + 40, 5, 4);

        // Dobok Pants
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 10, by + 26, 8, 15);
        ctx.fillRect(ox + 22, by + 26, 8, 15);
        ctx.fillStyle = dobokShade;
        ctx.fillRect(ox + 16, by + 28, 2, 13);
        ctx.fillRect(ox + 28, by + 28, 2, 13);

        // Dobok Torso
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 12, by + 14, 16, 13);
        // V-Neck collar trim
        ctx.fillStyle = dobokTrim;
        ctx.fillRect(ox + 18, by + 14, 4, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 19, by + 14, 2, 4);

        // Belt (Dynamic Color!)
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 11, by + 24, 18, 4);
        ctx.fillStyle = beltDark;
        ctx.fillRect(ox + 11, by + 26, 18, 2);
        // Belt knot and hanging tails
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 18, by + 27, 4, 7);
        ctx.fillStyle = beltAccent;
        ctx.fillRect(ox + 19, by + 28, 2, 6);

        // Head & Face
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 15, by + 4, 11, 10);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 15, by + 11, 11, 3);
        // Eyes (Determined look)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(ox + 20, by + 7, 4, 3);
        ctx.fillStyle = "#1B2631";
        ctx.fillRect(ox + 22, by + 7, 2, 3);
        // Eyebrows
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 19, by + 6, 6, 1);

        // Black Spiky Hair & Forehead Band
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 14, by + 1, 13, 5);
        ctx.fillRect(ox + 13, by + 3, 3, 5);
        ctx.fillRect(ox + 26, by + 3, 3, 4);
        // Spikes
        ctx.fillRect(ox + 16, by - 1, 3, 3);
        ctx.fillRect(ox + 21, by - 2, 4, 4);
        ctx.fillRect(ox + 26, by + 0, 3, 3);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 18, by + 2, 6, 2);

        // Arms (Taekwondo Guard Stance)
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8, by + 15, 6, 9);
        ctx.fillRect(ox + 26, by + 16, 6, 8);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 7, by + 22, 5, 5); // Left fist in guard
        ctx.fillRect(ox + 28, by + 21, 5, 5); // Right fist
      }

      else if (pose === "walk") {
        const offset = (frame % 4);
        const legOffsets = [
          { l: -3, r: 3, h: 0 },
          { l: 0, r: 0, h: -1 },
          { l: 4, r: -4, h: 0 },
          { l: 0, r: 0, h: -1 }
        ][offset];

        const by = oy + legOffsets.h;

        // Feet
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 12 + legOffsets.l, by + 40, 6, 4);
        ctx.fillRect(ox + 22 + legOffsets.r, by + 40, 6, 4);

        // Pants
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 11 + legOffsets.l, by + 26, 8, 15);
        ctx.fillRect(ox + 21 + legOffsets.r, by + 26, 8, 15);

        // Torso
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 13, by + 14, 15, 13);
        ctx.fillStyle = dobokTrim;
        ctx.fillRect(ox + 18, by + 14, 4, 6);

        // Belt
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 12, by + 24, 17, 4);
        ctx.fillStyle = beltDark;
        ctx.fillRect(ox + 12, by + 26, 17, 2);
        // Belt tails flying with movement
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 16 - legOffsets.l, by + 27, 4, 7);

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 15, by + 4, 11, 10);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(ox + 20, by + 7, 4, 3);
        ctx.fillStyle = "#1B2631";
        ctx.fillRect(ox + 22, by + 7, 2, 3);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 14, by + 1, 13, 5);
        ctx.fillRect(ox + 16, by - 1, 4, 3);
        ctx.fillRect(ox + 22, by - 2, 4, 4);

        // Arms swinging in guard
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8 - legOffsets.l, by + 15, 6, 8);
        ctx.fillRect(ox + 26 + legOffsets.l, by + 15, 6, 8);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 7 - legOffsets.l, by + 22, 5, 5);
        ctx.fillRect(ox + 28 + legOffsets.l, by + 21, 5, 5);
      }

      else if (pose === "crouch") {
        const by = oy + 12; // Lower body

        // Feet & legs tucked
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 10, by + 28, 7, 4);
        ctx.fillRect(ox + 24, by + 28, 7, 4);

        // Crouched Pants
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8, by + 18, 24, 11);
        ctx.fillStyle = dobokShade;
        ctx.fillRect(ox + 16, by + 20, 4, 9);

        // Torso
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 12, by + 8, 16, 11);

        // Belt
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 10, by + 16, 19, 4);
        ctx.fillStyle = beltDark;
        ctx.fillRect(ox + 10, by + 18, 19, 2);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 18, by + 19, 4, 7);

        // Head lowered
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 16, by - 1, 11, 10);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(ox + 21, by + 2, 4, 3);
        ctx.fillStyle = "#1B2631";
        ctx.fillRect(ox + 23, by + 2, 2, 3);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 15, by - 4, 13, 5);
        ctx.fillRect(ox + 17, by - 6, 4, 3);

        // Guard fists tight
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8, by + 8, 7, 8);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 8, by + 15, 6, 5);
      }

      else if (pose === "jump") {
        const by = oy - 4;

        // Tucked jump legs
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 12, by + 34, 5, 4);
        ctx.fillRect(ox + 24, by + 31, 5, 4);

        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 10, by + 22, 9, 13);
        ctx.fillRect(ox + 22, by + 20, 9, 12);

        // Torso
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 12, by + 10, 16, 12);

        // Belt flying upwards
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 11, by + 20, 18, 4);
        ctx.fillStyle = beltDark;
        ctx.fillRect(ox + 11, by + 22, 18, 2);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 17, by + 23, 5, 8);

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 15, by + 0, 11, 10);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 14, by - 3, 13, 5);
        ctx.fillRect(ox + 18, by - 6, 5, 4);

        // High Guard Arms
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 7, by + 8, 6, 8);
        ctx.fillRect(ox + 27, by + 7, 6, 8);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 7, by + 4, 5, 5);
        ctx.fillRect(ox + 28, by + 3, 5, 5);
      }

      else if (pose === "attack_stand") {
        // DOLLYO CHAGI (Roundhouse Kick)
        const by = oy;

        // Support Leg (Left)
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 10, by + 40, 6, 4);
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 9, by + 26, 8, 15);

        // Torso rotated
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 12, by + 14, 14, 13);

        // Belt snapping sideways
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 11, by + 24, 16, 4);
        ctx.fillStyle = beltDark;
        ctx.fillRect(ox + 11, by + 26, 16, 2);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 6, by + 26, 6, 3); // Belt tail snapping left

        // Head focused on target
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 13, by + 4, 11, 10);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(ox + 18, by + 7, 4, 3);
        ctx.fillStyle = "#1B2631";
        ctx.fillRect(ox + 20, by + 7, 2, 3);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 12, by + 1, 13, 5);

        // Kicking Leg extended forward! (Right leg horizontal roundhouse)
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 24, by + 20, 14, 7);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 37, by + 19, 7, 8); // Instep/Foot striking!

        // Speed/Whoosh Line
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(ox + 44, by + 18, 4, 2);
        ctx.fillRect(ox + 42, by + 26, 5, 2);

        // Guard Arm
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 16, by + 15, 6, 7);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 16, by + 21, 5, 5);
      }

      else if (pose === "attack_crouch") {
        // AP CHAGI RASANTE (Low sweep kick along the ground)
        const by = oy + 12;

        // Support body low
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8, by + 14, 16, 14);

        // Belt
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 7, by + 20, 17, 4);

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 12, by + 4, 11, 10);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 11, by + 1, 13, 5);

        // Sweeping Leg extended flat on the floor!
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 22, by + 22, 16, 7);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 38, by + 22, 8, 7);

        // Ground dust / sweep streak
        ctx.fillStyle = "#EAECEE";
        ctx.fillRect(ox + 43, by + 28, 5, 2);
        ctx.fillRect(ox + 35, by + 30, 8, 1);

        // Arms touching floor for leverage
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 4, by + 24, 6, 6);
      }

      else if (pose === "attack_jump") {
        // TWICHAGI AÉREO (Flying Side Kick)
        const by = oy - 4;

        // Tucked support leg
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 8, by + 18, 10, 8);

        // Horizontal Torso
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 14, by + 12, 16, 12);

        // Belt trailing behind
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 12, by + 18, 14, 4);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 4, by + 19, 8, 3);

        // Head looking ahead
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 18, by + 5, 10, 9);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 16, by + 2, 11, 5);

        // Kicking Leg (Full horizontal thrust)
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 28, by + 14, 13, 8);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 41, by + 13, 7, 9); // Sole of foot forward

        // Aerial Wind trail
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(ox + 48, by + 12, 3, 2);
        ctx.fillRect(ox + 47, by + 21, 4, 2);
      }

      else if (pose === "special") {
        // KIHAP SAGRADO / TORNADO TAEKWONDO
        const by = oy + Math.sin(frame * Math.PI) * 4;

        // Glowing Ki Aura behind Nacho
        const auraColor = (frame % 2 === 0) ? "rgba(241, 196, 15, 0.6)" : "rgba(52, 152, 219, 0.6)";
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(ox + 24, by + 24, 22 + frame * 2, 0, Math.PI * 2);
        ctx.fill();

        // Spinning body
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 14, by + 12, 20, 16);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 10, by + 22, 28, 5);
        ctx.fillStyle = beltAccent;
        ctx.fillRect(ox + 6, by + 23, 36, 3);

        // Spinning Kicks radiating outward
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 34, by + 16, 12, 7);
        ctx.fillRect(ox + 2, by + 24, 12, 7);

        // Head with glowing determined eyes
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 18, by + 4, 12, 10);
        ctx.fillStyle = "#F1C40F"; // Glowing yellow eyes
        ctx.fillRect(ox + 22, by + 7, 4, 3);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 16, by + 0, 15, 6);

        // Energy Shockwave Particles
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(ox + 44, by + 10, 4, 4);
        ctx.fillRect(ox + 0, by + 30, 4, 4);
      }

      else if (pose === "hurt") {
        const by = oy + 2;

        // Recoiling backward
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 14, by + 40, 6, 4);
        ctx.fillRect(ox + 24, by + 40, 6, 4);
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 12, by + 26, 8, 15);
        ctx.fillRect(ox + 22, by + 26, 8, 15);

        // Torso pushed back
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 10, by + 14, 16, 13);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 9, by + 24, 18, 4);

        // Head thrown back with pain expression
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 11, by + 4, 11, 10);
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 9, by + 1, 13, 5);
        // Closed eye / pain mark
        ctx.fillStyle = "#922B21";
        ctx.fillRect(ox + 14, by + 8, 4, 2);

        // Red hurt flash overlay
        ctx.fillStyle = "rgba(231, 76, 60, 0.4)";
        ctx.fillRect(ox + 6, by, 32, 44);
      }

      else if (pose === "dead") {
        // Fallen on the floor
        const by = oy + 32;
        ctx.fillStyle = dobokWhite;
        ctx.fillRect(ox + 6, by + 4, 34, 9);
        ctx.fillStyle = beltColor;
        ctx.fillRect(ox + 18, by + 4, 6, 9);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 38, by + 5, 8, 7); // Head on ground
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 40, by + 3, 7, 9);
      }
    };

    // Build the collection of frame textures for Nacho
    const nachoFrames = {};
    const states = [
      { name: "idle", frames: 4 },
      { name: "walk", frames: 4 },
      { name: "crouch", frames: 2 },
      { name: "jump", frames: 1 },
      { name: "attack_stand", frames: 1 },
      { name: "attack_crouch", frames: 1 },
      { name: "attack_jump", frames: 1 },
      { name: "special", frames: 4 },
      { name: "hurt", frames: 1 },
      { name: "dead", frames: 1 }
    ];

    states.forEach(s => {
      nachoFrames[s.name] = [];
      for (let f = 0; f < s.frames; f++) {
        const { canvas, ctx } = this.createCanvas(w, h);
        drawDobok(ctx, 0, 0, s.name, f);
        nachoFrames[s.name].push(this.toTexture(canvas));
      }
    });

    this.textures[key] = nachoFrames;
    return nachoFrames;
  }

  // ==========================================
  // ENEMY SPRITES (16-BIT RETRO ARCHETYPES)
  // ==========================================
  generateEnemyTextures() {
    if (this.textures.enemies) return this.textures.enemies;
    const enemyTextures = {};

    // 1. ZOMBI BÁSICO (Walker)
    enemyTextures.walker = { walk: [], grab: [], dead: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(48, 48);
      const bob = Math.sin(f * Math.PI / 2) * 2;
      const legShift = (f % 2 === 0) ? -2 : 2;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(24, 44, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ripped Pants (Grey/Purple)
      ctx.fillStyle = "#4A235A";
      ctx.fillRect(16 + legShift, 28 + bob, 7, 14);
      ctx.fillRect(25 - legShift, 28 + bob, 7, 14);
      // Exposed Rotten Knees
      ctx.fillStyle = "#58D68D";
      ctx.fillRect(17 + legShift, 33 + bob, 4, 3);

      // Decayed Torso in Tattered Brown Rags
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(16, 16 + bob, 16, 13);
      // Rotten Flesh showing
      ctx.fillStyle = "#58D68D";
      ctx.fillRect(18, 20 + bob, 5, 4);

      // Outstretched Zombie Arms
      ctx.fillStyle = "#58D68D";
      ctx.fillRect(28, 18 + bob, 14, 5); // Right arm forward
      ctx.fillRect(12, 19 + bob, 6, 5);

      // Zombie Head & Jaw
      ctx.fillStyle = "#48C9B0";
      ctx.fillRect(18, 6 + bob, 12, 11);
      // Glowing Yellow/Red Eye
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(26, 9 + bob, 3, 3);
      // Missing jaw / Blood
      ctx.fillStyle = "#17202A";
      ctx.fillRect(24, 13 + bob, 5, 4);

      enemyTextures.walker.walk.push(this.toTexture(canvas));
    }

    // Walker Grab Pose
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = "#4A235A";
      ctx.fillRect(16, 28, 16, 14);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(16, 16, 16, 13);
      // Clinging forward arms
      ctx.fillStyle = "#58D68D";
      ctx.fillRect(28, 14, 16, 6);
      ctx.fillRect(28, 22, 16, 6);
      ctx.fillStyle = "#48C9B0";
      ctx.fillRect(18, 6, 12, 11);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(26, 9, 3, 3);
      enemyTextures.walker.grab = [this.toTexture(canvas)];
    }

    // Walker Dead Pose
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(8, 38, 24, 7);
      ctx.fillStyle = "#48C9B0";
      ctx.fillRect(28, 37, 10, 7);
      ctx.fillStyle = "rgba(100,0,0,0.5)";
      ctx.fillRect(6, 42, 34, 3);
      enemyTextures.walker.dead = [this.toTexture(canvas)];
    }

    // 2. ZOMBI RASTRERO (Crawler - Crawling on ground)
    enemyTextures.crawler = { crawl: [], dead: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(48, 32);
      const reach = (f % 2 === 0) ? 3 : -2;

      // Low shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(24, 28, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trailing severed legs/torso
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(6, 18, 14, 8);
      // Spine/Rot
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(10, 16, 8, 3);

      // Main Torso
      ctx.fillStyle = "#1ABC9C";
      ctx.fillRect(18, 14, 15, 10);

      // Crawling Arms reaching forward on floor!
      ctx.fillStyle = "#16A085";
      ctx.fillRect(28 + reach, 22, 14, 5);
      ctx.fillRect(18 - reach, 22, 10, 5);

      // Low Snarling Head
      ctx.fillStyle = "#1ABC9C";
      ctx.fillRect(30, 11, 10, 9);
      // Red Eye
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(36, 13, 3, 3);

      enemyTextures.crawler.crawl.push(this.toTexture(canvas));
    }
    {
      const { canvas, ctx } = this.createCanvas(48, 32);
      ctx.fillStyle = "#16A085";
      ctx.fillRect(10, 24, 28, 5);
      enemyTextures.crawler.dead = [this.toTexture(canvas)];
    }

    // 3. ESPECTRO VOLADOR (Wraith / Banshee)
    enemyTextures.wraith = { fly: [], dead: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(48, 48);
      const bob = Math.sin(f * Math.PI / 2) * 3;
      const trail = f * 2;

      // Ethereal Ghostly Aura
      ctx.fillStyle = "rgba(142, 68, 173, 0.3)";
      ctx.beginPath();
      ctx.arc(24, 22 + bob, 16, 0, Math.PI * 2);
      ctx.fill();

      // Ghostly floating shroud (Cyan & Indigo)
      ctx.fillStyle = "#8E44AD";
      ctx.fillRect(16, 16 + bob, 16, 16);
      ctx.fillStyle = "#5DADE2";
      ctx.fillRect(18, 18 + bob, 12, 12);

      // Tattered spectral tail drifting
      ctx.fillStyle = "rgba(93, 173, 226, 0.7)";
      ctx.fillRect(12 + (trail % 4), 30 + bob, 6, 10);
      ctx.fillRect(22 - (trail % 4), 32 + bob, 7, 8);

      // Skull face with glowing cyan hollow eyes
      ctx.fillStyle = "#EAECEE";
      ctx.fillRect(18, 8 + bob, 12, 10);
      ctx.fillStyle = "#00F0FF";
      ctx.fillRect(20, 11 + bob, 3, 3);
      ctx.fillRect(26, 11 + bob, 3, 3);

      // Claws
      ctx.fillStyle = "#D5D8DC";
      ctx.fillRect(28, 20 + bob, 8, 4);

      enemyTextures.wraith.fly.push(this.toTexture(canvas));
    }
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = "rgba(0, 240, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(24, 24, 18, 0, Math.PI * 2);
      ctx.fill();
      enemyTextures.wraith.dead = [this.toTexture(canvas)];
    }

    // 4. CHAMÁN OSCURO (Caster)
    enemyTextures.caster = { idle: [], cast: [], dead: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(48, 48);
      const bob = Math.sin(f * Math.PI / 2) * 1.5;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(24, 44, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Robe (Dark Crimson & Gold)
      ctx.fillStyle = "#78281F";
      ctx.fillRect(16, 18 + bob, 16, 24);
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(22, 20 + bob, 4, 22);

      // Skull Mask
      ctx.fillStyle = "#F4F6F7";
      ctx.fillRect(18, 8 + bob, 12, 11);
      ctx.fillStyle = "#922B21";
      ctx.fillRect(20, 11 + bob, 3, 3);
      ctx.fillRect(26, 11 + bob, 3, 3);

      // Antlers / Shaman Horns
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(14, 3 + bob, 4, 7);
      ctx.fillRect(30, 3 + bob, 4, 7);

      // Magic Staff
      ctx.fillStyle = "#424949";
      ctx.fillRect(32, 10, 3, 34);
      ctx.fillStyle = "#E74C3C";
      ctx.beginPath();
      ctx.arc(33, 9, 5, 0, Math.PI * 2);
      ctx.fill();

      enemyTextures.caster.idle.push(this.toTexture(canvas));
    }
    // Cast Pose
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = "#78281F";
      ctx.fillRect(16, 18, 16, 24);
      ctx.fillStyle = "#F4F6F7";
      ctx.fillRect(18, 8, 12, 11);
      // Glowing orbs at hands
      ctx.fillStyle = "#FF5733";
      ctx.beginPath();
      ctx.arc(36, 18, 8, 0, Math.PI * 2);
      ctx.fill();
      enemyTextures.caster.cast = [this.toTexture(canvas)];
      enemyTextures.caster.dead = [this.toTexture(canvas)];
    }

    this.textures.enemies = enemyTextures;
    return enemyTextures;
  }

  // ==========================================
  // 5 ZONE BOSSES (16-BIT ARCADE TITANS)
  // ==========================================
  generateBossTextures() {
    if (this.textures.bosses) return this.textures.bosses;
    const bosses = {};

    // BOSS 1: El Carnicero Mutante (City Boss)
    bosses.boss_butcher = { idle: [], attack: [], hurt: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const bob = Math.sin(f * Math.PI / 2) * 2;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(32, 58, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Legs
      ctx.fillStyle = "#34495E";
      ctx.fillRect(20, 38 + bob, 11, 20);
      ctx.fillRect(33, 38 + bob, 11, 20);

      // Huge Bloody Apron & Torso
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(18, 18 + bob, 28, 22);
      ctx.fillStyle = "#F2F4F4";
      ctx.fillRect(22, 20 + bob, 20, 20);
      ctx.fillStyle = "#900C3F";
      ctx.fillRect(24, 25 + bob, 6, 12);

      // Pig Head / Leather Mask
      ctx.fillStyle = "#D98880";
      ctx.fillRect(22, 6 + bob, 20, 14);
      ctx.fillStyle = "#17202A";
      ctx.fillRect(24, 11 + bob, 4, 3);
      ctx.fillRect(36, 11 + bob, 4, 3);

      // Giant Meat Cleaver
      ctx.fillStyle = "#BDC3C7";
      ctx.fillRect(44, 14 + bob, 12, 20);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(42, 28 + bob, 4, 12);

      bosses.boss_butcher.idle.push(this.toTexture(canvas));
    }
    // Attack swing
    {
      const { canvas, ctx } = this.createCanvas(64, 64);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(18, 18, 28, 22);
      ctx.fillStyle = "#D98880";
      ctx.fillRect(22, 6, 20, 14);
      // Cleaver swinging down!
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(42, 34, 18, 16);
      ctx.fillStyle = "#C0392B";
      ctx.fillRect(44, 40, 14, 5);
      bosses.boss_butcher.attack = [this.toTexture(canvas)];
      bosses.boss_butcher.hurt = [this.toTexture(canvas)];
    }

    // BOSS 2: Kukulkán Corrupto (Jungle Boss)
    bosses.boss_shaman = { idle: [], attack: [], hurt: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const bob = Math.sin(f * Math.PI / 2) * 3;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(32, 58, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Serpent tail / Jungle robes
      ctx.fillStyle = "#145A32";
      ctx.fillRect(20, 24 + bob, 24, 32);
      ctx.fillStyle = "#27AE60";
      ctx.fillRect(24, 28 + bob, 16, 26);

      // Feather Headdress (Aztec/Serpent style)
      ctx.fillStyle = "#F1C40F";
      ctx.fillRect(18, 4 + bob, 28, 6);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(22, 0 + bob, 20, 5);

      // Snake Mask with Fangs
      ctx.fillStyle = "#1E8449";
      ctx.fillRect(24, 10 + bob, 16, 14);
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(27, 13 + bob, 3, 3);
      ctx.fillRect(35, 13 + bob, 3, 3);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(28, 21 + bob, 2, 4);
      ctx.fillRect(34, 21 + bob, 2, 4);

      // Venom Staff
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(44, 10, 4, 46);
      ctx.fillStyle = "#2ECC71";
      ctx.beginPath();
      ctx.arc(46, 8, 8, 0, Math.PI * 2);
      ctx.fill();

      bosses.boss_shaman.idle.push(this.toTexture(canvas));
    }
    bosses.boss_shaman.attack = bosses.boss_shaman.idle;
    bosses.boss_shaman.hurt = bosses.boss_shaman.idle;

    // BOSS 3: Yeti Ancestral de Escarcha (Ice Boss)
    bosses.boss_golem = { idle: [], attack: [], hurt: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const bob = Math.sin(f * Math.PI / 2) * 2;

      // Heavy Frost Legs
      ctx.fillStyle = "#AED6F1";
      ctx.fillRect(18, 38 + bob, 13, 20);
      ctx.fillRect(33, 38 + bob, 13, 20);

      // Massive Fur Torso
      ctx.fillStyle = "#EBF5FB";
      ctx.fillRect(14, 16 + bob, 36, 26);
      ctx.fillStyle = "#85C1E9";
      ctx.fillRect(18, 22 + bob, 28, 18);

      // Ice Spikes on Back
      ctx.fillStyle = "#3498DB";
      ctx.fillRect(10, 10 + bob, 6, 12);
      ctx.fillRect(48, 10 + bob, 6, 12);

      // Horned Beast Head & Glowing Blue Eyes
      ctx.fillStyle = "#D6EAF8";
      ctx.fillRect(22, 6 + bob, 20, 14);
      ctx.fillStyle = "#00F0FF";
      ctx.fillRect(25, 10 + bob, 4, 4);
      ctx.fillRect(35, 10 + bob, 4, 4);

      // Huge Ice Fists
      ctx.fillStyle = "#2980B9";
      ctx.fillRect(8, 28 + bob, 10, 12);
      ctx.fillRect(46, 28 + bob, 10, 12);

      bosses.boss_golem.idle.push(this.toTexture(canvas));
    }
    bosses.boss_golem.attack = bosses.boss_golem.idle;
    bosses.boss_golem.hurt = bosses.boss_golem.idle;

    // BOSS 4: Señor de la Ceniza (Fire Boss)
    bosses.boss_pyro = { idle: [], attack: [], hurt: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const bob = Math.sin(f * Math.PI / 2) * 2;

      // Black Basalt Armor with Magma cracks
      ctx.fillStyle = "#1C2833";
      ctx.fillRect(18, 20 + bob, 28, 36);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(22, 26 + bob, 20, 4);
      ctx.fillRect(26, 34 + bob, 12, 4);

      // Flaming Horns & Crown
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(20, 2 + bob, 6, 8);
      ctx.fillRect(38, 2 + bob, 6, 8);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(22, 0 + bob, 20, 4);

      // Demon Face with Burning Eyes
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(22, 8 + bob, 20, 14);
      ctx.fillStyle = "#FFC300";
      ctx.fillRect(25, 12 + bob, 4, 4);
      ctx.fillRect(35, 12 + bob, 4, 4);

      // Flaming Gauntlets
      ctx.fillStyle = "#E67E22";
      ctx.fillRect(10, 26 + bob, 10, 12);
      ctx.fillRect(44, 26 + bob, 10, 12);

      bosses.boss_pyro.idle.push(this.toTexture(canvas));
    }
    bosses.boss_pyro.attack = bosses.boss_pyro.idle;
    bosses.boss_pyro.hurt = bosses.boss_pyro.idle;

    // BOSS 5: LORD RYOKO - Gran Maestro del Dragón Oscuro (Final Boss)
    bosses.boss_dragon = { idle: [], attack: [], hurt: [] };
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const bob = Math.sin(f * Math.PI / 2) * 1.5;

      // Dark Ki Aura
      ctx.fillStyle = "rgba(142, 68, 173, 0.4)";
      ctx.beginPath();
      ctx.arc(32, 28 + bob, 24, 0, Math.PI * 2);
      ctx.fill();

      // Shadow Feet & Stance
      ctx.fillStyle = "#17202A";
      ctx.fillRect(20, 42 + bob, 8, 16);
      ctx.fillRect(36, 42 + bob, 8, 16);

      // Corrupted Black Taekwondo Dobok with Gold Dragon Insignia
      ctx.fillStyle = "#1C1C1C";
      ctx.fillRect(18, 18 + bob, 28, 26);
      ctx.fillStyle = "#F39C12"; // Golden Dragon crest
      ctx.fillRect(26, 24 + bob, 12, 10);

      // Corrupted Crimson Belt (Dark Dan)
      ctx.fillStyle = "#900C3F";
      ctx.fillRect(16, 32 + bob, 32, 5);
      ctx.fillStyle = "#E74C3C";
      ctx.fillRect(28, 35 + bob, 6, 10);

      // Menacing Head with Silver Hair & Red Glowing Eyes
      ctx.fillStyle = "#FAD7A0";
      ctx.fillRect(24, 8 + bob, 16, 12);
      ctx.fillStyle = "#BDC3C7"; // Silver Grandmaster Hair
      ctx.fillRect(22, 4 + bob, 20, 6);
      ctx.fillRect(20, 6 + bob, 4, 14);
      ctx.fillStyle = "#E74C3C"; // Glowing eyes of fury
      ctx.fillRect(27, 12 + bob, 3, 3);
      ctx.fillRect(35, 12 + bob, 3, 3);

      // Dark Ki Flaming Fists
      ctx.fillStyle = "#8E44AD";
      ctx.fillRect(12, 22 + bob, 8, 8);
      ctx.fillRect(44, 22 + bob, 8, 8);

      bosses.boss_dragon.idle.push(this.toTexture(canvas));
    }
    bosses.boss_dragon.attack = bosses.boss_dragon.idle;
    bosses.boss_dragon.hurt = bosses.boss_dragon.idle;

    this.textures.bosses = bosses;
    return bosses;
  }

  // ==========================================
  // PROJECTILES & VFX TEXTURES
  // ==========================================
  generateVFXTextures() {
    if (this.textures.vfx) return this.textures.vfx;
    const vfx = {};

    // 1. Dark Energy Projectile
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = "#8E44AD";
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#00F0FF";
      ctx.beginPath();
      ctx.arc(8, 8, 3, 0, Math.PI * 2);
      ctx.fill();
      vfx.projectile_dark = this.toTexture(canvas);
    }

    // 2. Fire Projectile
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = "#E74C3C";
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#F1C40F";
      ctx.beginPath();
      ctx.arc(8, 8, 4, 0, Math.PI * 2);
      ctx.fill();
      vfx.projectile_fire = this.toTexture(canvas);
    }

    // 3. Ice Shard
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = "#85C1E9";
      ctx.beginPath();
      ctx.moveTo(16, 8);
      ctx.lineTo(4, 2);
      ctx.lineTo(0, 8);
      ctx.lineTo(4, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(4, 7, 8, 2);
      vfx.projectile_ice = this.toTexture(canvas);
    }

    // 4. Hit Spark / Comic Star
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = "#F1C40F";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = (i % 2 === 0) ? 11 : 4;
        const a = (i * Math.PI) / 4;
        const x = 12 + Math.cos(a) * r;
        const y = 12 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      vfx.hit_spark = this.toTexture(canvas);
    }

    // 5. Special Kihap Wave Ring
    {
      const { canvas, ctx } = this.createCanvas(64, 64);
      const grad = ctx.createRadialGradient(32, 32, 8, 32, 32, 30);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(0.5, "rgba(241, 196, 15, 0.8)");
      grad.addColorStop(0.8, "rgba(52, 152, 219, 0.5)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
      vfx.kihap_shockwave = this.toTexture(canvas);
    }

    // 6. Dust Particle
    {
      const { canvas, ctx } = this.createCanvas(8, 8);
      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.beginPath();
      ctx.arc(4, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      vfx.dust = this.toTexture(canvas);
    }

    this.textures.vfx = vfx;
    return vfx;
  }
}

// Global Pixel Art Generator Instance
window.pixelArt = new PixelArtGenerator();
