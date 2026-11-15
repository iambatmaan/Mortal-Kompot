// ===== Mortal Kompot: input + fight engine =====
const ACTIONS = ['left', 'right', 'up', 'down', 'punch', 'kick', 'special', 'block', 'super'];
const DEFAULT_KEYS = [
  { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', punch: 'KeyF', kick: 'KeyG', special: 'KeyH', block: 'KeyR', super: 'KeyT' },
  { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', punch: 'KeyK', kick: 'KeyL', special: 'Semicolon', block: 'KeyO', super: 'KeyP' }
];
const Input = (() => {
  let keys = JSON.parse(JSON.stringify(DEFAULT_KEYS));
  try { const s = JSON.parse(localStorage.getItem('mk_keys')); if (s && s.length === 2) keys = s; } catch (e) { /* defaults */ }
  const held = new Set(), pressed = new Map(), consumed = [new Map(), new Map()];
  let capture = null, active = false;
  function clearBuffer() { pressed.clear(); consumed.forEach(keys => keys.clear()); }
  function clear() { held.clear(); clearBuffer(); }
  window.addEventListener('keydown', e => {
    if (capture) { e.preventDefault(); const cb = capture; capture = null; cb(e.code); return; }
    if (!active) return;
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (!e.repeat && !held.has(e.code)) pressed.set(e.code, performance.now());
    held.add(e.code);
  });
  window.addEventListener('keyup', e => held.delete(e.code));
  window.addEventListener('blur', clear);
  return {
    keys, clearBuffer,
    activate(value) { if (active !== value) clear(); active = value; },
    get(p) {
      const k = keys[p], inp = {}, now = performance.now();
      for (const action of ACTIONS) {
        const code = k[action], at = pressed.get(code);
        inp[action] = ['left', 'right', 'down', 'block'].includes(action)
          ? held.has(code)
          : at !== undefined && now - at < 170 && at !== consumed[p].get(code);
      }
      inp.jumpHeld = held.has(k.up);
      return inp;
    },
    consume(p, action) {
      const code = keys[p][action];
      consumed[p].set(code, pressed.get(code));
    },
    captureNext(cb) { capture = cb; },
    save() { try { localStorage.setItem('mk_keys', JSON.stringify(keys)); } catch (e) { /* ok */ } },
    reset() { for (let p = 0; p < 2; p++) Object.assign(keys[p], DEFAULT_KEYS[p]); this.save(); },
    label(code) { return code.replace('Key', '').replace('Arrow', '').replace('Digit', '').replace('Semicolon', ';').toUpperCase(); }
  };
})();

const Game = (() => {
  const ATK = {
    punch: { start: 0.07, end: 0.17, total: 0.26, range: 34, dmg: 6, kb: 100, pose: 'punch', sfx: 'hit' },
    kick: { start: 0.13, end: 0.26, total: 0.4, range: 42, dmg: 9, kb: 165, pose: 'kick', sfx: 'heavy' }
  };
  const CPU = {
    easy: { reaction: 0.24, guard: 0.26, special: 0.12, attack: 0.56 },
    normal: { reaction: 0.14, guard: 0.48, special: 0.27, attack: 0.77 },
    hard: { reaction: 0.08, guard: 0.66, special: 0.40, attack: 0.91 }
  };
  const MEME = ['OSH!', 'VAY!', 'BRAT...', '+100 AURA', '-1000 AURA', 'SKILL ISSUE', 'ZO\'R!', 'OYINGA AYT!', 'NIMA GAP?!', 'EMOTIONAL DAMAGE', 'QOYIL!', 'GG AKA'];
  const SUPER_TIME = 8;
  const FLURRY_HITS = [0.11, 0.24, 0.39];

  let F = [], projs = [], parts = [], texts = [];
  let stage = 0, mode = 'cpu', difficulty = CPU.normal, matchType = 'classic', round = 1, wins = [0, 0], timer = 60, nextCall = 0;
  let phase = 'off', pt = 0, shake = 0, hitstop = 0, banner = '', bannerCol = '#fff', sub = '', onEnd = null, gt = 0, said = false, endSent = false;

  const rnd = Math.random;
  function approach(value, target, limit) {
    return value + Math.max(-limit, Math.min(limit, target - value));
  }
  const isLow = f => f.st === 'crouch' || (f.st === 'block' && f.low) || (f.st === 'atk' && f.a?.level === 'low');
  function mk(d, x, face, player) {
    return { d, player, x, y: FLOOR, vx: 0, vy: 0, face, hp: 100, meter: 0, st: 'idle', t: 0, a: null, cd: 0, buff: 0, stun: 0, ground: true,
      flash: 0, bubble: '', bt: 0, combo: 0, ct: 0, ai: { t: 0, inp: {} }, callAt: 0, guardSpent: false,
      stride: 0, airTime: 0, landing: 0, jumpCut: false, airStrike: false };
  }
  function set(f, st) { if (f.st !== st) { f.st = st; f.t = 0; } }

  function start(d1, d2, options, cb) {
    mode = options.mode;
    difficulty = CPU[options.difficulty] || CPU.normal;
    matchType = options.matchType;
    onEnd = cb; plovParty = false; wins = [0, 0]; round = 1; gt = nextCall = hitstop = shake = 0;
    stage = STAGES.length - 1;
    F = [];
    newRound(d1, d2);
    AudioSys.music('fight');
  }
  function newRound(d1 = F[0].d, d2 = F[1].d) {
    const meters = F[0]?.d === d1 && F[1]?.d === d2 ? F.map(f => f.meter) : [0, 0];
    const lastCalls = F[0]?.d === d1 && F[1]?.d === d2 ? F.map(f => f.callAt) : [0, 0];
    F = [mk(d1, 150, 1, 0), mk(d2, 330, -1, 1)];
    F.forEach((f, i) => { f.meter = meters[i]; f.callAt = lastCalls[i]; });
    projs = []; parts = []; texts = []; timer = 60; phase = 'intro'; pt = 0; said = false; endSent = false;
    banner = 'ROUND ' + round; bannerCol = '#ffd54a';
    sub = matchType === 'endless' ? (round > 1 && round % 2 === 1 ? 'ENDLESS / NEW FIGHTERS' : 'ENDLESS / HOVLI') : STAGES[stage].name;
    AudioSys.stopFighter();
    AudioSys.sfx('gong'); AudioSys.announce('Round ' + round);
  }
  function stop() { phase = 'off'; F = []; AudioSys.stopFighter(); }

  function bubble(f, s) { f.bubble = s; f.bt = 1.2; }
  function callout(f) {
    if (gt < nextCall || gt < f.callAt) return;
    if (AudioSys.playFighter(f.d.fightSound || f.d.selectSound, 'fight')) {
      nextCall = gt + 3;
      f.callAt = gt + 9;
      bubble(f, f.d.phrase);
    }
  }
  function spark(x, y, col, n) {
    for (let i = 0; i < (n || 6); i++) parts.push({ x, y, vx: (rnd() - 0.5) * 220, vy: -rnd() * 200, t: 0, life: 0.35 + rnd() * 0.3, col, g: 600 });
  }
  function floatText(x, y, s, col) { texts.push({ x, y, s, col: col || '#fff', t: 0 }); }

  function inRange(f, o, range, level) {
    const dx = (o.x - f.x) * f.face;
    const y = f.y - (level === 'low' ? 14 : level === 'overhead' ? 20 : 33);
    return dx >= -4 && dx <= range + 8 && y >= o.y - (isLow(o) ? 39 : 62) && y <= o.y + 2;
  }

  function applyHit(att, vic, move, fromX = att.x) {
    if (phase !== 'fight' || vic.st === 'ko' || vic.st === 'win') return false;
    const { level = 'mid', kb = 160, launch = 0, sfx = 'heavy' } = move;
    if (vic.a?.kind === 'uppercut' && vic.t < 0.20 && level === 'mid') {
      if (!vic.a.evaded) floatText(vic.x, vic.y - 75, 'SLIP!', '#69f0ae');
      vic.a.evaded = true;
      return 'evaded';
    }
    const dir = fromX <= vic.x ? 1 : -1;
    let dmg = move.dmg * att.d.power * (att.buff > 0 ? 1.45 : 1);
    const blocked = vic.st === 'block' && vic.face === -dir &&
      (level === 'mid' || (level === 'low' && vic.low) || (level === 'overhead' && !vic.low));
    const counter = vic.st === 'atk' && vic.t < (vic.a.start || 0);
    if (blocked) {
      const perfect = !vic.guardSpent && vic.t <= 0.13;
      vic.guardSpent = true;
      dmg *= perfect ? 0 : 0.15;
      vic.vx = dir * kb * (perfect ? 0.14 : 0.36);
      AudioSys.sfx(perfect ? 'parry' : 'block');
      spark(vic.x - dir * 10, vic.y - 36, perfect ? '#69f0ae' : '#9cf', perfect ? 8 : 4);
      if (perfect) {
        floatText(vic.x, vic.y - 76, 'PERFECT BLOCK', '#69f0ae');
        if (vic.buff <= 0) vic.meter = Math.min(100, vic.meter + 10);
      }
      vic.hp = Math.max(1, vic.hp - dmg);
    } else {
      if (counter) dmg *= 1.15;
      vic.hp -= dmg;
      set(vic, 'hit'); vic.t = 0; vic.a = null; vic.stun = 0.17 + Math.min(0.15, kb / 1800);
      vic.vx = dir * kb; vic.flash = 0.075;
      if (launch || !vic.ground) { vic.ground = false; vic.vy = -Math.max(launch, 95); }
      AudioSys.sfx(sfx); hitstop = kb >= 150 ? 0.055 : 0.028;
      shake = Math.min(7, 2 + dmg * 0.35);
      spark(vic.x - dir * 6, vic.y - 34, '#ffd54a', 7);
      att.combo = att.ct > 0 ? att.combo + 1 : 1; att.ct = 0.95;
      if (att.combo >= 3) {
        floatText(att.x, att.y - 86, 'x' + att.combo + ' COMBO!', '#ff8686');
        if (att.combo === 3) callout(att);
      } else if (counter) floatText(vic.x, vic.y - 76, 'COUNTER!', '#ffd54a');
      else if (rnd() < 0.22) floatText(vic.x, vic.y - 76, MEME[Math.floor(rnd() * MEME.length)], '#fff');
    }
    if (att.buff <= 0) att.meter = Math.min(100, att.meter + dmg * 1.7);
    if (vic.buff <= 0) vic.meter = Math.min(100, vic.meter + dmg * 0.9);
    if (vic.hp <= 0) { vic.hp = 0; endRound(F.indexOf(att), true); }
    return true;
  }

  function endRound(w, ko) {
    if (phase !== 'fight') return;
    phase = 'ko'; pt = 0;
    if (w >= 0) wins[w]++;
    AudioSys.stopFighter();
    if (ko) {
      const loser = F[1 - w];
      set(loser, 'ko'); loser.vx = (loser.x > F[w].x ? 1 : -1) * 160; loser.vy = -200; loser.ground = false;
      banner = F[w].hp >= 100 ? 'FLAWLESS OSH!' : 'K.O.!';
      AudioSys.sfx('ko'); AudioSys.announce(banner === 'K.O.!' ? 'K O' : 'Flawless osh');
    } else { banner = w < 0 ? 'ROUND DRAW' : 'TIME UP!'; AudioSys.sfx('horn'); }
    bannerCol = '#ff5252'; sub = ''; shake = 8;
  }

  function startSpecial(f) {
    const s = f.d.spec;
    const start = { proj: 0.20, dash: 0.13, flurry: 0.11, uppercut: 0.22 }[s.kind];
    const total = { proj: 0.50, dash: 0.55, flurry: 0.64, uppercut: 0.52 }[s.kind];
    set(f, 'atk'); f.t = 0; f.cd = s.cooldown; f.vx = 0;
    f.a = { spec: true, kind: s.kind, start, total, done: false, hitIndex: 0 };
    floatText(f.x, f.y - 101, s.name, '#ffd54a');
    callout(f);
    AudioSys.sfx(s.kind === 'dash' ? 'beep' : 'special');
  }

  function updAtk(f, o) {
    const a = f.a;
    if (!a.spec) {
      if (f.ground) f.vx = 0;
      if (!a.done && f.t >= a.start && f.t <= a.end && inRange(f, o, a.range, a.level)) a.done = applyHit(f, o, a);
    } else {
      const s = f.d.spec;
      if (a.kind === 'proj' && !a.done && f.t >= a.start) {
        a.done = true;
        AudioSys.sfx('whoosh');
        const base = { x: f.x + f.face * 18, y: f.y - (s.roll ? 8 : 42), vx: f.face * s.vx, vy: s.vy,
          g: s.g, owner: f, sprite: s.sprite, dmg: s.dmg, kb: s.kb, level: s.level, t: 0, face: f.face, splash: s.splash };
        if (s.triple) for (const vy of [-60, 0, 60]) projs.push({ ...base, vy });
        else projs.push(base);
      } else if (a.kind === 'dash') {
        f.vx = f.t >= a.start && f.t < 0.42 && !a.done ? f.face * 315 : 0;
        if (!a.done && f.t >= a.start && f.t < 0.43 && inRange(f, o, 29)) a.done = applyHit(f, o, s);
      } else if (a.kind === 'flurry') {
        f.vx = f.t < 0.45 ? f.face * 38 : 0;
        const hitAt = FLURRY_HITS[a.hitIndex];
        if (f.t >= hitAt) {
          a.hitIndex++;
          const finish = a.hitIndex === FLURRY_HITS.length;
          if (inRange(f, o, 34)) applyHit(f, o, { dmg: s.dmg + (finish ? 2 : 0), kb: finish ? 170 : 32, sfx: finish ? 'heavy' : 'hit' });
        }
      } else if (a.kind === 'uppercut') {
        f.vx = f.t < a.start ? f.face * 118 : 0;
        if (!a.done && f.t >= a.start && f.t < 0.33 && inRange(f, o, 32)) {
          a.done = applyHit(f, o, { ...s, dmg: s.dmg + (a.evaded ? 3 : 0) });
        }
      }
    }
    if (f.t >= a.total) {
      f.a = null;
      if (f.ground) f.vx = 0;
      set(f, f.ground ? 'idle' : 'jump');
    }
  }

  function updFighter(f, o, inp, dt) {
    f.t += dt; f.cd = Math.max(0, f.cd - dt); f.flash = Math.max(0, f.flash - dt); f.bt -= dt; f.ct -= dt;
    f.landing = Math.max(0, f.landing - dt);
    const direction = Number(!!inp.right) - Number(!!inp.left);
    if (f.buff > 0) { f.buff -= dt; f.meter = Math.max(0, f.buff / SUPER_TIME * 100); if (f.buff <= 0) { f.meter = 0; floatText(f.x, f.y - 80, 'CHOY TUGADI...', '#aaa'); } }

    if (f.st === 'hit') { if (f.t >= f.stun && f.ground) set(f, 'idle'); }
    else if (f.st === 'ko' || f.st === 'win') { /* nothing */ }
    else if (f.st === 'tea') { f.vx = 0; if (f.t >= 1.3) { f.buff = SUPER_TIME; set(f, 'idle'); AudioSys.sfx('superUp'); floatText(f.x, f.y - 84, 'DAMAGE UP!', '#69f0ae'); spark(f.x, f.y - 40, '#69f0ae', 16); } }
    else if (f.st === 'atk') updAtk(f, o);
    else if (f.ground) {
      f.face = o.x >= f.x ? 1 : -1;
      if (inp.super && f.meter >= 100 && f.buff <= 0) {
        consume(f, 'super'); f.meter = 0;
        set(f, 'tea'); f.vx = 0; AudioSys.sfx('slurp'); bubble(f, 'CHOY TIME!');
      } else if (inp.special && f.cd <= 0) {
        consume(f, 'special'); startSpecial(f);
      } else if (inp.punch || inp.kick) {
        startNormal(f, inp.kick ? 'kick' : 'punch', inp.down ? 'low' : 'mid');
      } else if (inp.block) {
        if (f.st !== 'block') f.guardSpent = false;
        set(f, 'block'); f.vx = 0; f.low = inp.down;
      } else if (inp.up) {
        consume(f, 'up');
        f.ground = false; f.airTime = f.landing = 0; f.jumpCut = false;
        f.vy = -340; f.vx = direction ? direction * Math.max(Math.abs(f.vx), f.d.speed * 0.64) : f.vx * 0.45;
        set(f, 'jump'); AudioSys.sfx('jump');
      } else if (inp.down) { set(f, 'crouch'); f.vx = 0; }
      else {
        const target = direction * f.d.speed * (direction === f.face ? 1 : 0.78);
        const acceleration = direction && f.vx * direction >= 0 ? 1150 : 1650;
        f.vx = approach(f.vx, target, acceleration * dt);
        set(f, Math.abs(f.vx) > 7 ? 'walk' : 'idle');
      }
    } else if (f.st === 'jump' && !f.airStrike && (inp.punch || inp.kick)) {
      f.airStrike = true;
      startNormal(f, inp.kick ? 'kick' : 'punch', 'overhead');
    }

    if (!f.ground) {
      f.airTime += dt;
      if (f.st === 'jump' && direction) f.vx = approach(f.vx, direction * f.d.speed, 440 * dt);
      if ((f.st === 'jump' || f.a?.level === 'overhead') && !f.jumpCut && inp.jumpHeld === false && f.airTime >= 0.10 && f.vy < -115) {
        f.vy = -115;
        f.jumpCut = true;
      }
      f.vy += 900 * dt; f.y += f.vy * dt;
      if (f.y >= FLOOR) {
        const landingSpeed = f.vy;
        f.y = FLOOR; f.vy = 0; f.ground = true; f.airStrike = false;
        if (f.st === 'jump' || (f.st === 'atk' && f.a && !f.a.spec)) {
          const stillMoving = direction && f.vx * direction > 0;
          f.a = null; f.landing = 0.15; f.vx *= stillMoving ? 0.68 : 0.30;
          set(f, stillMoving ? 'walk' : 'idle');
          if (landingSpeed > 240) {
            const dust = '#d9b38d';
            spark(f.x, FLOOR - 2, dust, 4);
          }
        }
        if (f.st === 'ko') { shake = 6; AudioSys.sfx('heavy'); }
      }
    }
    const prevX = f.x;
    f.x = Math.max(16, Math.min(W - 16, f.x + f.vx * dt));
    if (f.st === 'walk') f.stride += (f.x - prevX) * f.face * 0.16;
    if (f.ground && (f.st === 'hit' || f.st === 'ko' || f.st === 'block')) f.vx *= Math.pow(0.002, dt);
  }

  function consume(f, action) {
    if (f.player === 0 || mode === 'pvp') Input.consume(f.player, action);
  }

  function startNormal(f, kind, level) {
    consume(f, kind);
    f.a = { ...ATK[kind], ...f.d.normal?.[kind], level, done: false };
    if (level === 'low') {
      f.a.pose = 'c' + kind;
      f.a.range -= 3;
    }
    if (f.ground) f.vx = 0;
    set(f, 'atk'); f.t = 0; AudioSys.sfx('whoosh');
  }

  function aiInput(f, o, dt) {
    const ai = f.ai; ai.t -= dt;
    if (ai.t > 0) return ai.inp;
    ai.t = difficulty.reaction + rnd() * 0.09;
    const inp = {}, dx = o.x - f.x, dist = Math.abs(dx);
    const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right';
    const projectile = projs.find(p => p.owner !== f && (f.x - p.x) * p.vx > 0 && Math.abs(p.x - f.x) < 75);
    const threatening = projectile || (o.st === 'atk' && dist < 60);
    const r = rnd(), canSpecial = f.cd <= 0 && dist < f.d.spec.reach;
    if (threatening && r < difficulty.guard) {
      inp.block = true;
      inp.down = (projectile || o.a)?.level === 'low';
    } else if (threatening && r < difficulty.guard + 0.1 && projectile?.level === 'low') inp.up = true;
    else if (!threatening && f.meter >= 100 && f.buff <= 0 && dist > 70 && r < 0.4) inp.super = true;
    else if (canSpecial && r < difficulty.special) inp.special = true;
    else if (dist > f.d.preferred + 12 || (dist > 52 && !canSpecial)) inp[toward] = true;
    else if (dist > 52 || (dist < 30 && f.d.preferred > 90 && r > 0.73)) inp[away] = r > 0.52;
    else if (r < difficulty.attack) {
      if (dist < (f.d.normal?.punch?.range || ATK.punch.range) + 5 && r < difficulty.attack * 0.64) inp.punch = true;
      else inp.kick = true;
      inp.down = o.st === 'block' && !o.low && r < difficulty.attack * 0.52;
    }
    const out = { ...inp };
    inp.punch = inp.kick = inp.special = inp.super = inp.up = false;
    ai.inp = inp;
    return out;
  }

  function updProjs(dt) {
    for (const p of projs) {
      p.t += dt; p.x += p.vx * dt; p.vy += p.g * dt; p.y += p.vy * dt;
      const v = F[1 - p.owner.player];
      const from = p.x - Math.sign(p.vx) * 9;
      if (!p.passed && Math.abs(p.x - v.x) < 18 && p.y >= v.y - (isLow(v) ? 39 : 62) && p.y <= v.y + 2) {
        const contact = applyHit(p.owner, v, p, from);
        if (contact === 'evaded') p.passed = true;
        else if (contact) { p.dead = true; spark(p.x, p.y, '#fff', 8); }
      }
      if (!p.dead && p.y >= FLOOR && p.vy > 0) {
        p.dead = true;
        spark(p.x, FLOOR - 3, p.splash ? '#68e5ff' : '#fff', p.splash ? 16 : 6);
        if (p.splash && v.ground && Math.abs(v.x - p.x) < 31) applyHit(p.owner, v, { dmg: 5, kb: 85, level: 'low' }, from);
      }
      if (p.x < -20 || p.x > W + 20 || p.t > 2.8) p.dead = true;
    }
    projs = projs.filter(p => !p.dead);
  }

  function rotateFighters() {
    const available = FIGHTERS.filter(d => F.every(f => f.d !== d));
    const next = () => available.splice(Math.floor(rnd() * available.length), 1)[0];
    wins = [0, 0];
    newRound(next(), next());
  }

  function finishMatch() {
    const w = Math.sign(wins[1] - wins[0]);
    phase = 'end'; pt = 0; bannerCol = '#ffd54a';
    F.forEach(f => { f.y = FLOOR; f.ground = true; f.vx = f.vy = 0; f.a = null; set(f, 'idle'); });
    if (w === 0) {
      banner = 'MATCH DRAW'; sub = wins.join(' - ');
      AudioSys.sfx('gong'); AudioSys.announce('Match draw');
    } else {
      const f = F[w > 0 ? 1 : 0];
      f.x = Math.max(40, Math.min(W - 40, f.x)); set(f, 'win');
      banner = f.d.short + ' WINS!'; sub = wins.join(' - ');
      AudioSys.sfx('horn'); AudioSys.announce(banner); plovParty = true;
    }
  }

  function update(dt) {
    if (phase === 'off') return;
    gt += dt; pt += dt;
    shake = Math.max(0, shake - dt * 30);
    if (hitstop > 0) { hitstop -= dt; return; }
    const sdt = phase === 'ko' && pt < 1 ? dt * 0.35 : dt;
    const none = {};
    const i0 = phase === 'fight' ? Input.get(0) : none;
    const i1 = phase === 'fight' ? (mode === 'cpu' ? aiInput(F[1], F[0], sdt) : Input.get(1)) : none;
    updFighter(F[0], F[1], i0, sdt); updFighter(F[1], F[0], i1, sdt);
    // keep fighters apart
    const a = F[0], b = F[1];
    if (a.ground && b.ground && a.st !== 'ko' && b.st !== 'ko' && Math.abs(a.x - b.x) < 22) {
      const push = (22 - Math.abs(a.x - b.x)) / 2, s = a.x <= b.x ? -1 : 1;
      a.x = Math.max(16, Math.min(W - 16, a.x + s * push)); b.x = Math.max(16, Math.min(W - 16, b.x - s * push));
    }
    if (phase === 'fight') updProjs(sdt);
    for (const p of parts) { p.t += sdt; p.vy += p.g * sdt; p.x += p.vx * sdt; p.y += p.vy * sdt; }
    parts = parts.filter(p => p.t < p.life);
    for (const t of texts) t.t += dt;
    texts = texts.filter(t => t.t < 1.1);

    if (phase === 'intro') {
      if (pt > 1.5 && !said) { said = true; banner = 'FIGHT!'; bannerCol = '#ff3d3d'; sub = ''; AudioSys.announce('Fight!'); AudioSys.sfx('laugh'); shake = 8; }
      if (pt > 2.3) { phase = 'fight'; banner = ''; Input.clearBuffer(); }
    } else if (phase === 'fight') {
      timer -= dt;
      if (timer <= 0) {
        timer = 0;
        const lead = F[0].hp - F[1].hp;
        endRound(Math.abs(lead) < 0.01 ? -1 : lead > 0 ? 0 : 1, false);
      }
    } else if (phase === 'ko') {
      if (pt > 2.2) {
        if (matchType === 'classic' && round === 2) finishMatch();
        else {
          round++;
          if (matchType === 'endless' && round % 2 === 1) rotateFighters();
          else newRound();
        }
      }
    } else if (phase === 'end') {
      if (plovParty && Math.floor(pt * 2) !== Math.floor((pt - dt) * 2)) AudioSys.sfx('eat');
      if (pt > 1.3 && !endSent) { endSent = true; if (onEnd) onEnd(); }
    }
  }
  let plovParty = false;

  // ---------- drawing ----------
  function attackMotion(f) {
    const a = f.a;
    if (!a) return {};
    if (a.kind === 'flurry') {
      const distances = FLURRY_HITS.map(hit => Math.abs(f.t - hit));
      const beat = distances.indexOf(Math.min(...distances));
      return { strike: Math.max(0, 1 - distances[beat] / 0.10), beat };
    }
    const release = a.end ?? (a.kind === 'uppercut' ? 0.33 : a.start + 0.045);
    if (f.t < a.start) {
      const prep = f.t / a.start;
      return { windup: Math.sin(prep * Math.PI), strike: Math.max(0, (prep - 0.72) / 0.28), reach: a.range };
    }
    return { strike: f.t <= release ? 1 : Math.max(0, (a.total - f.t) / (a.total - release)), reach: a.range };
  }

  function poseOf(f) {
    switch (f.st) {
      case 'atk': if (!f.a) return 'idle'; if (!f.a.spec) return f.a.pose;
        return f.a.kind === 'proj' ? 'throw' : f.a.kind === 'uppercut' ? (f.t < f.a.start ? 'weave' : 'uppercut') : f.a.kind;
      case 'block': return f.low ? 'cblock' : 'block';
      default: return f.st;
    }
  }
  function bar(c, x, y, w, h, v, col, flip) {
    R(c, x - 2, y - 2, w + 4, h + 4, '#d4a017'); R(c, x - 1, y - 1, w + 2, h + 2, '#111'); R(c, x, y, w, h, '#7a0f0f');
    const fw = Math.round(w * Math.max(0, Math.min(1, v)));
    R(c, flip ? x + w - fw : x, y, fw, h, col); R(c, flip ? x + w - fw : x, y, fw, 2, 'rgba(255,255,255,.35)');
  }
  function drawProj(c, p) {
    if (p.sprite === 'teapot') drawTeapot(c, p.x, p.y);
    else if (p.sprite === 'melon') drawMelon(c, p.x, p.y, p.t * 14);
    else if (p.sprite === 'somsa') { c.save(); if (p.face < 0) { c.translate(Math.round(p.x) * 2, 0); c.scale(-1, 1); } drawSomsa(c, p.x, p.y); c.restore(); }
  }

  function draw(c) {
    if (phase === 'off') return;
    c.save();
    if (shake > 0) c.translate(Math.round((rnd() - 0.5) * shake), Math.round((rnd() - 0.5) * shake));
    c.drawImage(getStage(stage), 0, 0);
    if (plovParty && phase === 'end') for (let i = 0; i < 26; i++) { const x = (i * 71) % W, y = ((gt * (40 + i % 5 * 12) + i * 47) % (H + 20)) - 20; if (i % 2) drawPlov(c, x, y); else R(c, x, y, 2, 1, '#f0c24f'); }

    for (const f of F) {
      const lift = Math.max(0, Math.min(1, (FLOOR - f.y) / 80));
      c.fillStyle = 'rgba(0,0,0,' + (0.35 - lift * 0.19) + ')';
      c.beginPath(); c.ellipse(f.x, FLOOR + 1, 16 - lift * 6, 4 - lift * 1.2, 0, 0, 7); c.fill();
    }
    const order = F[0].st === 'atk' ? [F[1], F[0]] : [F[0], F[1]];
    for (const f of order) {
      const pose = poseOf(f);
      const sup = f.buff > 0 || (f.st === 'tea' && f.t > 0.33);
      if (f.buff > 0) { // golden aura + steam
        c.globalAlpha = 0.35 + Math.sin(gt * 20) * 0.15; c.fillStyle = '#ffd54a'; c.beginPath(); c.ellipse(f.x, f.y - 30, 22, 38, 0, 0, 7); c.fill(); c.globalAlpha = 1;
        for (let i = 0; i < 4; i++) { const s = (gt * 40 + i * 17) % 40; R(c, f.x - 14 + i * 9, f.y - 30 - s, 2, 3, i % 2 ? '#fff' : '#69f0ae'); }
      }
      if (f.st === 'atk' && f.a && f.a.kind === 'dash' && f.t >= f.a.start && f.t < 0.42) {
        drawDamas(c, f.x, f.y, f.face, gt);
        for (let i = 0; i < 4; i++) R(c, f.x - f.face * (30 + i * 9), f.y - 6 - i * 3, 5, 5, 'rgba(220,220,220,' + (0.7 - i * 0.15) + ')');
      } else {
        drawFighter(c, f.d, f.x, f.y, f.face, pose, pose === 'idle' ? gt : f.t, {
          ...attackMotion(f), doppi: sup, flash: f.flash > 0, stride: f.stride,
          pace: f.vx * f.face / f.d.speed, airborne: !f.ground, arc: f.vy / 340, landing: f.landing / 0.15,
          recoil: f.st === 'hit' ? Math.max(0.25, 1 - f.t / f.stun) : 1
        });
        if (f.st === 'tea') { // doppi drops from the sky, tea on the way
          const dy = Math.max(0, 1 - f.t * 3) * 70; if (dy > 0) { R(c, f.x - 6, f.y - 63 - dy, 12, 5, '#111'); R(c, f.x - 4, f.y - 61 - dy, 2, 1, '#fff'); R(c, f.x + 2, f.y - 61 - dy, 2, 1, '#fff'); }
          for (let i = 0; i < 3; i++) R(c, f.x + f.face * 10 + i * 2, f.y - 62 - ((gt * 30 + i * 6) % 14), 1, 2, '#fff');
        }
        if (f.st === 'win') { drawPlov(c, f.x + f.face * 22, f.y); drawTeapot(c, f.x - f.face * 24, f.y - 5); }
      }
      c.globalAlpha = 1;
    }
    if (phase === 'fight') for (const p of projs) drawProj(c, p);
    for (const p of parts) R(c, p.x, p.y, 2, 2, p.col);
    for (const f of F) if (f.bt > 0) {
      c.font = '8px "Press Start 2P", "Courier New", monospace';
      const w = Math.ceil(c.measureText(f.bubble).width) + 8, bx = Math.max(2, Math.min(W - w - 2, f.x - w / 2)), by = f.y - 92;
      R(c, bx - 1, by - 1, w + 2, 15, '#111'); R(c, bx, by, w, 13, '#fff'); R(c, f.x - 2, by + 13, 4, 3, '#fff');
      c.fillStyle = '#111'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(f.bubble, bx + 4, by + 7);
    }
    for (const t of texts) { c.globalAlpha = Math.max(0, 1 - t.t); txt(c, t.s, Math.max(50, Math.min(W - 50, t.x)), t.y - t.t * 30, t.col, 8); c.globalAlpha = 1; }
    c.restore();

    // HUD
    const hpCol = v => v > 0.5 ? '#ffd54a' : v > 0.2 ? '#ff9800' : '#ff3d3d';
    bar(c, 16, 12, 190, 10, F[0].hp / 100, hpCol(F[0].hp / 100), true);
    bar(c, W - 206, 12, 190, 10, F[1].hp / 100, hpCol(F[1].hp / 100), false);
    txt(c, F[0].d.short, 16, 31, '#fff', 8, 'left'); txt(c, (mode === 'cpu' ? 'CPU ' : '') + F[1].d.short, W - 16, 31, '#fff', 8, 'right');
    R(c, 224, 6, 32, 22, '#111'); R(c, 226, 8, 28, 18, '#7a0f0f'); txt(c, String(Math.ceil(timer)).padStart(2, '0'), 240, 18, '#ffd54a', 12);
    for (let p = 0; p < 2; p++) for (let i = 0; i < 2; i++) {
      const x = p ? W - 24 - i * 14 : 24 + i * 14;
      if (i < wins[p]) drawPlov(c, x, 50); else { R(c, x - 5, 46, 10, 3, '#555'); }
    }
    for (let p = 0; p < 2; p++) {
      const f = F[p], x = p ? W - 136 : 16, full = f.meter >= 100 && f.buff <= 0;
      bar(c, x, 256, 120, 6, f.meter / 100, f.buff > 0 ? '#69f0ae' : full ? (Math.floor(gt * 8) % 2 ? '#fff' : '#00e5ff') : '#00b8d4', !!p);
      drawTeapot(c, p ? x + 130 : x - 4 + 0, 249); // little tea icon
      txt(c, f.buff > 0 ? 'DO\'PPI MODE!' : full ? 'SUPER READY!' : 'CHOY', p ? x + 116 : x + 8, 248, full ? '#ffd54a' : '#fff', 8, p ? 'right' : 'left');
      if (f.cd > 0) R(c, p ? x + 120 - Math.round(f.cd / f.d.spec.cooldown * 120) : x, 264, Math.round(f.cd / f.d.spec.cooldown * 120), 2, '#e040fb');
    }
    if (phase === 'fight' && (F[0].hp <= 15 || F[1].hp <= 15) && Math.floor(gt * 4) % 2) txt(c, 'FINISH PLOV!', 240, 62, '#ff3d3d', 8);
    if (banner) {
      const s = phase === 'intro' && said ? 32 : 24, wob = Math.round(Math.sin(gt * 30) * (phase === 'intro' && said ? 2 : 0));
      txt(c, banner, 240 + wob, 108, bannerCol, banner.length > 14 ? 16 : s);
      if (sub) txt(c, sub, 240, 136, '#fff', 8);
    }
  }

  return { start, stop, update, draw, get phase() { return phase; }, get fighters() { return F; } };
})();
