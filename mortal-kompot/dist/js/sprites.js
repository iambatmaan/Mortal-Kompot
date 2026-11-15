// ===== Mortal Kompot: fighters, props and backgrounds, all drawn with pixels in code =====
const W = 480, H = 270, FLOOR = 238;

// Fighter styles and signature moves.
const FIGHTERS = [
  { id: 'chingiz', name: 'CHINGIZ', short: 'CHINGIZ', style: 'MID-RANGE', bio: 'Obed Arc · a teapot that splashes on landing.', portrait: 'assets/chingiz.jpg', selectSound: 'assets/chingiz-obed.m4a',
    phrase: 'Obed!', fightSound: 'assets/chingiz-fight.m4a', preferred: 95,
    spec: { name: 'OBED ARC', kind: 'proj', sprite: 'teapot', vx: 210, vy: -190, g: 520, dmg: 12, level: 'overhead', splash: true, reach: 166, cooldown: 2.2 },
    normal: { kick: { range: 48, kb: 185 } },
    skin: '#dc9e76', hair: '#33241f', hairStyle: 'curly', beard: 'long', hat: 'laurel', top: '#30435e', topStyle: 'sash', accent: '#d6a837',
    pants: '#2b3140', shoes: '#352720', belly: 4, speed: 105, power: 1.05, voice: { pitch: 0.6, rate: 0.9 } },
  { id: 'olim', name: 'Olim', short: 'Olim Aka', style: 'HEAVY ZONER', bio: 'Olim Roll · a low melon you have to crouch-block or jump.',
    portrait: 'assets/olim.jpg', selectSound: 'assets/olim.m4a', phrase: 'Olim mani ismim!', preferred: 110,
    spec: { name: 'OLIM ROLL', kind: 'proj', sprite: 'melon', vx: 275, vy: 0, g: 0, roll: true, dmg: 11, level: 'low', reach: 200, cooldown: 2.1 },
    normal: { punch: { start: 0.10, dmg: 7 }, kick: { start: 0.16, total: 0.48, dmg: 10 } },
    skin: '#bb8065', hair: '#292225', hairStyle: 'receding', beard: 'chinstrap', top: '#666468', topStyle: 'raglan', accent: '#808084',
    pants: '#34333b', shoes: '#262022', belly: 6, speed: 95, power: 1.15, voice: { pitch: 0.65, rate: 0.9 } },
  { id: 'tursunxon', name: 'Tursunxon', short: 'Tursunkhan', style: 'RUSH DOWN', bio: 'Chiq Dash · cross the gap with a Damas charge.',
    portrait: 'assets/tursunxon.jpg', selectSound: 'assets/tursunxon.m4a', phrase: 'Hoy, tualetdan chiq!', preferred: 40,
    spec: { name: 'CHIQ DASH', kind: 'dash', dmg: 14, kb: 270, reach: 125, cooldown: 2.35 },
    normal: { kick: { start: 0.10, total: 0.34, dmg: 8 } },
    skin: '#d2977c', hair: '#202126', hairStyle: 'swept', beard: 'none', top: '#303849', topStyle: 'checkedSuit', accent: '#626c7a',
    pants: '#303849', shoes: '#211e24', belly: 1, speed: 125, power: 0.95, voice: { pitch: 1.05, rate: 1.15 } },
  { id: 'importniy-bomj', name: 'Импортный бомж', short: 'Importniy bomj', style: 'SPACE CONTROL', bio: 'Import Spread · three somsas fan out at different heights.',
    portrait: 'assets/importniy-bomj.jpg', selectSound: 'assets/importniy-bomj.m4a', phrase: 'Мен импортный бомж!', preferred: 112,
    spec: { name: 'IMPORT SPREAD', kind: 'proj', sprite: 'somsa', vx: 215, vy: 0, g: 0, triple: true, dmg: 4.5, reach: 175, cooldown: 2.65 },
    normal: { punch: { range: 42, kb: 130 } },
    skin: '#bc855f', hair: '#392c27', hairStyle: 'short', beard: 'saltPepper', hat: 'embroideredCap',
    top: '#566675', topStyle: 'winterCoat', accent: '#9cabb3',
    pants: '#37393f', shoes: '#202026', belly: 5, speed: 100, power: 1.1, voice: { pitch: 0.65, rate: 0.93 } },
  { id: 'qor-aka', name: 'qor aka', short: 'qor aka relax', style: 'COUNTER STRIKER', bio: 'Relax Flurry · three fast hits with a heavy finish.',
    portrait: 'assets/qor-aka.jpg', selectSound: 'assets/qor-aka.m4a', phrase: 'Mani videoga olyaptimi?', preferred: 29,
    spec: { name: 'RELAX FLURRY', kind: 'flurry', dmg: 3.5, reach: 48, cooldown: 2.1 },
    normal: { punch: { start: 0.045, end: 0.15, total: 0.21, dmg: 5.2 } },
    skin: '#dfa88e', hair: '#262326', hairStyle: 'short', beard: 'none', hat: 'backCap',
    top: '#27302f', topStyle: 'darkTee', accent: '#475553',
    pants: '#343d3e', shoes: '#282931', belly: 3, speed: 130, power: 1.0, voice: { pitch: 1.1, rate: 1.0 } },
  { id: 'tayson', name: "O'zbek Tayson", short: 'Tayson aka', style: 'INSIDE BOXER', bio: 'Suv Slip · weave past straight hits, then launch with an uppercut.',
    portrait: 'assets/tayson.jpg', selectSound: 'assets/tayson.m4a', phrase: "Suv kabi bo'l.", preferred: 33,
    spec: { name: 'SUV SLIP', kind: 'uppercut', dmg: 12, kb: 95, launch: 235, reach: 66, cooldown: 2.4 },
    normal: { punch: { start: 0.05, end: 0.15, total: 0.22, dmg: 7 }, kick: { range: 35, dmg: 7.5 } },
    skin: '#ce8c59', hair: '#26282d', hairStyle: 'boxingFade', beard: 'none', faceInk: true,
    top: '#232733', topStyle: 'trainingTank', accent: '#e2ddd0',
    pants: '#555b66', shoes: '#212632', belly: 2, speed: 110, power: 1.1, voice: { pitch: 0.85, rate: 1.0 } }
];

const PATRIOT = { id: 'patriot', name: 'VATANPARVAR', skin: '#d9a066', hair: '#2a1a10', hairStyle: 'short', beard: 'mustache', hat: 'doppi',
  top: '#143d8c', topStyle: 'chapan', accent: '#f1c40f', pants: '#222', shoes: '#111', belly: 3 };

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}

// (x, y) = feet centre. face = 1 right, -1 left.
function drawFighter(c, d, x, y, face, pose, t, o) {
  o = o || {};
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(face, 1);
  if (pose === 'ko') { c.translate(-22, -5); c.rotate(-Math.PI / 2); }
  const P = (px, py, w, h, col) => { c.fillStyle = o.flash ? '#fff' : col; c.fillRect(px, py, w, h); };
  const stride = o.stride ?? t * 10;
  const pace = Math.min(1, Math.abs(o.pace ?? 0.8));
  const swing = Math.sin(stride);
  const strike = o.strike ?? 1, windup = o.windup ?? 0;
  const arc = Math.max(-1, Math.min(1, o.arc ?? 0));
  const recoil = o.recoil ?? 1;

  let by = 0, lean = 0, legs = 'stand', aF = 'guard', aB = 'guard', hdx = 0, mouth = 'neutral';
  switch (pose) {
    case 'idle': by = 1 + Math.round(Math.sin(t * 4)); break;
    case 'walk':
      legs = 'walk'; aF = aB = 'swing';
      by = Math.round((2 - 3 * Math.abs(swing)) * pace);
      lean = Math.round((o.pace ?? 0.8) * 3);
      break;
    case 'jump':
      legs = 'tuck'; aF = arc > 0.65 ? 'guard' : 'up'; aB = 'guard';
      lean = Math.round((o.pace ?? 0) * 2);
      break;
    case 'crouch': by = 14; legs = 'crouch'; break;
    case 'punch': aF = 'punch'; lean = Math.round(4 * strike - 3 * windup); break;
    case 'cpunch': by = 14; legs = 'crouch'; aF = 'punch'; lean = Math.round(3 * strike - 2 * windup); break;
    case 'kick': legs = 'kick'; lean = Math.round(-4 * strike + 2 * windup); by = Math.round(3 * windup); break;
    case 'ckick': by = 14; legs = 'ckick'; lean = Math.round(-2 * strike); break;
    case 'block': aF = 'block'; aB = 'block'; by = 3; lean = -2; break;
    case 'face': aF = 'none'; aB = 'none'; break;
    case 'cblock': by = 14; legs = 'crouch'; aF = 'block'; aB = 'block'; break;
    case 'hit': lean = -Math.round(7 * recoil); hdx = -Math.round(3 * recoil); aF = 'flail'; aB = 'flail'; mouth = 'ouch'; break;
    case 'ko': aF = 'flail'; aB = 'flail'; mouth = 'ouch'; break;
    case 'throw': aF = 'throw'; lean = Math.round(4 * strike - 3 * windup); mouth = 'shout'; break;
    case 'dash': aF = 'punch'; aB = 'punch'; lean = 4; legs = 'walk'; mouth = 'shout'; break;
    case 'weave': by = 7 + Math.round(5 * windup); lean = 3; legs = 'crouch'; aF = 'block'; aB = 'guard'; break;
    case 'uppercut': lean = Math.round(5 * strike); by = Math.round(5 * (1 - strike)); aF = 'uppercut'; break;
    case 'flurry': { const front = (o.beat ?? Math.floor(t * 20)) % 2 === 0; aF = front ? 'punch' : 'guard'; aB = front ? 'guard' : 'punch'; lean = Math.round(4 * strike); mouth = 'shout'; break; }
    case 'tea': aF = 'drink'; break;
    case 'win': by = 22; legs = 'sit'; aF = (Math.floor(t * 4) % 2) ? 'eat' : 'plate'; aB = 'plate'; mouth = (Math.floor(t * 8) % 2) ? 'chew' : 'neutral'; break;
  }
  if (o.airborne && legs !== 'kick' && pose !== 'ko') legs = 'tuck';
  if (o.landing > 0 && (pose === 'idle' || pose === 'walk')) {
    by += Math.round(9 * o.landing ** 1.4);
    lean += Math.round(3 * o.landing);
    legs = 'land';
  }
  if (o.mood === 'angry') mouth = 'frown';
  if (o.mood === 'happy') mouth = 'smile';

  const skin = d.skin, skinD = shade(d.skin, 0.8), top = d.top, topD = shade(d.top, 0.75), pants = d.pants;
  const bare = ['tshirt', 'tank', 'raglan', 'darkTee', 'trainingTank'].includes(d.topStyle);
  const sleeve = bare ? skin : top;
  const hipY = -22 + by;

  function segment(x1, y1, x2, y2, size, color) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2));
    for (let i = 0; i <= steps; i++) {
      P(Math.round(x1 + (x2 - x1) * i / steps), Math.round(y1 + (y2 - y1) * i / steps), size, size, color);
    }
  }

  function arm(kind, sx, sy, back) {
    const col = back ? (bare ? skinD : topD) : sleeve, fist = back ? skinD : skin;
    if (['tshirt', 'raglan', 'darkTee'].includes(d.topStyle)) P(sx, sy, 5, 4, back ? topD : top);
    switch (kind) {
      case 'guard': P(sx, sy, 5, 9, col); P(sx + 3, sy + 4, 7, 5, col); P(sx + 9, sy + 1, 5, 6, fist); break;
      case 'swing': {
        const dx = Math.round(swing * (back ? -7 : 7) * pace);
        segment(sx, sy, sx + dx, sy + 8, 5, col);
        segment(sx + dx, sy + 8, sx + dx + 5, sy + 6, 5, col);
        P(sx + dx + 5, sy + 6, 5, 5, fist);
        break;
      }
      case 'punch': {
        const reach = 6 + Math.round((13 + Math.max(0, (o.reach ?? 34) - 34) * 0.30) * strike - 5 * windup);
        const elbow = sx + Math.round(reach * .53) - Math.round(3 * windup);
        const elbowY = sy + Math.round(6 * (1 - strike));
        const handY = sy + Math.round(2 * windup - 3 * strike);
        segment(sx, sy, elbow, elbowY, 5, col);
        segment(elbow, elbowY, sx + reach, handY, 5, col);
        P(sx + reach, handY, 6, 6, fist);
        break;
      }
      case 'block': P(sx + 4, sy - 8, 5, 16, col); P(sx + 4, sy - 13, 6, 6, fist); break;
      case 'up': P(sx, sy - 10, 5, 12, col); P(sx, sy - 15, 5, 6, fist); break;
      case 'flail': P(sx + 2, sy - 9, 5, 11, col); P(sx + 2, sy - 14, 5, 5, fist); break;
      case 'throw':
      case 'uppercut': {
        const dx = Math.round((kind === 'throw' ? 18 : 10) * strike - 6 * windup);
        const dy = Math.round((kind === 'throw' ? -6 : -17) * strike - 7 * windup);
        segment(sx, sy, sx + Math.round(dx * .45), sy + 4, 5, col);
        segment(sx + Math.round(dx * .45), sy + 4, sx + dx, sy + dy, 5, col);
        P(sx + dx, sy + dy, 6, 6, fist);
        break;
      }
      case 'drink': P(sx, sy, 5, 8, col); P(sx + 3, sy - 5, 5, 7, col); P(sx + 4, sy - 9, 5, 5, fist);
        P(sx + 3, sy - 13, 8, 4, '#fff'); P(sx + 3, sy - 13, 8, 1, '#1e5aa8'); P(sx + 5, sy - 9, 4, 1, '#fff'); break;
      case 'plate': P(sx, sy, 5, 9, col); P(sx + 3, sy + 7, 7, 4, col); P(sx + 9, sy + 7, 4, 4, fist); break;
      case 'eat': P(sx, sy, 5, 7, col); P(sx + 3, sy - 3, 5, 6, col); P(sx + 5, sy - 6, 5, 5, fist); P(sx + 7, sy - 8, 3, 2, '#f5d76e'); break;
    }
  }

  function drawLegs() {
    const sh = d.shoes;
    if (legs === 'sit') { P(-13, -7, 26, 7, pants); P(-15, -6, 4, 6, sh); P(11, -6, 4, 6, sh); return; }
    function leg(hip, knee, kneeY, ankle, ankleY, color) {
      segment(hip, hipY, knee, kneeY, 6, color);
      segment(knee, kneeY, ankle, ankleY, 5, color);
      P(ankle, ankleY + 2, 8, 3, sh);
    }
    const rear = shade(pants, 0.8);
    if (legs === 'walk') {
      const step = Math.round(swing * 9 * pace);
      const lift = Math.cos(stride) * 6 * pace;
      const frontY = -5 - Math.round(Math.max(0, lift)), rearY = -5 - Math.round(Math.max(0, -lift));
      leg(-6, -6 - Math.round(step / 2), hipY + 8, -8 - step, rearY, rear);
      leg(2, 4 + Math.round(step / 2), hipY + 7, 3 + step, frontY, pants);
    } else if (legs === 'tuck') {
      const extension = Math.round(12 * Math.max(0, arc));
      leg(-6, -9, hipY + 6, -11, -16 + extension, rear);
      leg(2, 11, hipY + 3, 4, -12 + Math.round(extension * .6), pants);
    } else if (legs === 'kick' || legs === 'ckick') {
      const low = legs === 'ckick';
      const footX = 8 + Math.round(20 * strike), footY = low ? -9 : hipY + 10 - Math.round(12 * strike);
      leg(-7, -10, hipY + 6, -10, o.airborne ? -9 : -5, rear);
      segment(2, hipY, 6 + Math.round(10 * strike), footY - (low ? 2 : 0), 6, pants);
      segment(6 + Math.round(10 * strike), footY - (low ? 2 : 0), footX, footY, 5, pants);
      P(footX, footY - 2, 5, 8, sh);
    } else {
      const crouched = legs === 'crouch' || legs === 'land';
      leg(-6, crouched ? -11 : -7, hipY + (crouched ? 2 : 8), crouched ? -12 : -9, -5, rear);
      leg(2, crouched ? 9 : 4, hipY + (crouched ? 2 : 8), crouched ? 5 : 3, -5, pants);
    }
  }

  // back arm, legs
  arm(aB, -9 + lean, -42 + by, true);
  if (legs !== 'sit') drawLegs();

  // torso
  const tx = -9 + lean, ty = -44 + by, tw = 18 + (d.belly || 0);
  P(tx, ty, tw, 22, top);
  P(tx, ty, 3, 22, topD);
  switch (d.topStyle) {
    case 'chapan': for (let i = 4; i < tw - 4; i += 4) P(tx + i, ty, 1, 22, d.accent);
      P(tx + tw - 6, ty, 3, 22, '#f5f5f5'); P(tx, ty + 15, tw, 2, d.accent); break;
    case 'raglan':
      P(tx + 7, ty, 9, 2, '#3d3a40');
      P(tx + 1, ty + 2, 4, 9, '#555259');
      P(tx + 6, ty + 14, tw - 7, 1, '#57545a');
      P(tx + tw - 4, ty + 10, 3, 9, '#777378');
      break;
    case 'checkedSuit':
      for (let x = 4; x < tw; x += 5) P(tx + x, ty + 1, 1, 20, '#424b60');
      for (let y = 4; y < 22; y += 5) P(tx + 2, ty + y, tw - 2, 1, '#414858');
      P(tx + 7, ty, 9, 8, '#e6e1d8');
      P(tx + 9, ty + 7, 5, 4, '#d0d3d0');
      P(tx + 10, ty + 1, 4, 2, '#191b23');
      P(tx + 11, ty + 3, 2, 8, '#1c2028');
      P(tx + 5, ty + 1, 2, 7, d.accent);
      P(tx + 7, ty + 7, 2, 4, d.accent);
      P(tx + 12, ty + 14, 1, 1, '#c29f75');
      break;
    case 'winterCoat':
      P(tx + 3, ty + 1, 5, 18, '#718092');
      P(tx + 8, ty + 1, 8, 21, '#404543');
      P(tx + 10, ty + 6, 1, 16, '#282e2f');
      P(tx + 13, ty + 4, 1, 18, d.accent);
      P(tx + 2, ty + 1, 7, 3, '#30363a');
      P(tx + 15, ty + 1, 7, 3, '#30363a');
      P(tx + 2, ty + 14, 5, 2, '#343b41');
      P(tx + 17, ty + 14, 4, 2, '#343b41');
      break;
    case 'darkTee':
      P(tx + 6, ty, 9, 2, '#191e20');
      P(tx + 8, ty + 2, 5, 1, d.accent);
      P(tx + 3, ty + 11, 1, 7, '#3b4845');
      P(tx + 5, ty + 20, tw - 5, 1, '#1b2524');
      break;
    case 'trainingTank':
      P(tx, ty, 3, 5, skin);
      P(tx + tw - 3, ty, 3, 5, skinD);
      P(tx + 7, ty, 6, 2, skin);
      P(tx + 7, ty + 6, 6, 1, d.accent);
      P(tx + 9, ty + 5, 3, 1, d.accent);
      for (let x = 5; x < 16; x += 2) P(tx + x, ty + 13, 1, 3, d.accent);
      P(tx + 4, ty + 17, 11, 1, '#727887');
      break;
    case 'sash': {
      for (let y = 3; y < 22; y += 4) {
        P(tx + 3, ty + y, tw - 3, 1, y % 8 === 3 ? '#718397' : '#875058');
      }
      for (let y = 0; y < 22; y += 2) {
        const x = tx + Math.max(3, 15 - y);
        const width = Math.min(9, tx + tw - x);
        P(x, ty + y, width, 2, '#c0a17a');
        P(x + 1, ty + y, width - 1, 2, '#f3e4ca');
        P(x + width - 2, ty + y, 2, 2, '#d5bb96');
      }
      P(tx + 15, ty + 2, 4, 4, '#8c5a24');
      P(tx + 16, ty + 2, 3, 3, d.accent);
      P(tx + 16, ty + 2, 1, 1, '#fff0a1');
      break;
    }
    case 'suit': P(tx + tw - 6, ty, 4, 12, '#f5f5f5'); P(tx + tw - 5, ty + 2, 2, 9, d.accent); break;
    case 'apron': P(tx + 6, ty + 6, tw - 6, 16, '#fff'); P(tx + 6, ty + 6, tw - 6, 1, d.accent); P(tx + 9, ty + 12, 4, 3, d.accent); break;
    case 'tank': P(tx + 5, ty + 8, tw - 7, 2, d.accent); P(tx + 5, ty + 11, tw - 9, 1, '#fff'); break;
    case 'tshirt': P(tx + 6, ty + 7, 7, 5, d.accent); break;
    case 'hoodie': P(tx + 7, ty + 12, 9, 6, topD); P(tx + tw - 5, ty + 2, 1, 7, '#ddd'); P(tx + 8, ty + 5, 5, 1, d.accent); P(tx + 8, ty + 7, 3, 1, d.accent); break;
    case 'ikat': for (let j = 2; j < 22; j += 5) for (let i = 3; i < tw - 1; i += 4) { P(tx + i, ty + j + (i % 8 ? 0 : 2), 2, 2, d.accent); P(tx + i + 1, ty + j + 2, 1, 1, '#fff'); } break;
  }
  if (d.chain) { P(tx + tw - 8, ty + 1, 6, 1, '#ffd700'); P(tx + tw - 6, ty + 2, 2, 3, '#ffd700'); }
  if (o.flagPatch) drawFlag(c, tx + 5, ty + 4, 9, 6, 0, true);
  if (legs === 'sit') drawLegs();

  // head
  const hx = -7 + lean + hdx, hy = -58 + by;
  P(-3 + lean, hy + 12, 6, 3, skinD);
  if (d.hat === 'hood' && !o.doppi) P(hx - 3, hy - 2, 6, 16, d.hatColor);
  if (d.hat === 'scarf') P(hx - 3, hy - 1, 6, 18, d.hatColor);
  P(hx, hy, 14, 13, skin);
  P(hx + 1, hy + 5, 2, 3, skinD); P(hx + 14, hy + 6, 1, 3, skinD);
  switch (d.hairStyle) {
    case 'receding':
      P(hx + 2, hy - 2, 10, 2, d.hair);
      P(hx, hy - 1, 4, 3, d.hair);
      P(hx, hy + 1, 2, 6, d.hair);
      P(hx + 11, hy - 1, 3, 3, d.hair);
      P(hx + 12, hy + 1, 2, 4, d.hair);
      break;
    case 'swept':
      P(hx + 1, hy - 4, 11, 5, d.hair);
      P(hx + 4, hy - 5, 8, 1, d.hair);
      P(hx, hy - 2, 4, 6, d.hair);
      P(hx + 3, hy, 4, 2, d.hair);
      P(hx + 11, hy - 2, 3, 5, d.hair);
      P(hx + 4, hy - 3, 6, 1, '#41454c');
      break;
    case 'boxingFade':
      P(hx, hy - 2, 13, 3, d.hair);
      P(hx + 2, hy - 3, 9, 1, d.hair);
      P(hx, hy + 1, 2, 4, '#6d4d40');
      P(hx + 12, hy, 2, 5, '#543e37');
      P(hx + 1, hy - 1, 10, 1, '#47495a');
      break;
    case 'short': P(hx, hy - 1, 14, 4, d.hair); P(hx, hy, 3, 7, d.hair); break;
    case 'fade': P(hx + 1, hy - 1, 13, 3, d.hair); P(hx, hy + 2, 2, 4, shade(d.hair === '#111' ? '#444444' : d.hair, 1)); break;
    case 'curly': for (let i = 0; i < 14; i += 3) P(hx + i, hy - 2 - (i % 2), 3, 5, d.hair); P(hx - 1, hy, 3, 8, d.hair); break;
    case 'bald': P(hx + 8, hy + 1, 3, 1, '#fff'); break;
  }
  // face
  const angry = o.mood === 'angry', happy = o.mood === 'happy';
  P(hx + 5, hy + 5, 2, 2, '#111'); P(hx + 10, hy + 5, 2, 2, '#111');
  if (angry) { P(hx + 4, hy + 2, 3, 1, '#111'); P(hx + 6, hy + 3, 2, 1, '#111'); P(hx + 9, hy + 3, 2, 1, '#111'); P(hx + 11, hy + 2, 2, 1, '#111'); }
  else if (happy) { P(hx + 4, hy + 2, 4, 1, d.hair); P(hx + 9, hy + 2, 4, 1, d.hair); P(hx + 5, hy + 5, 2, 1, skin); P(hx + 10, hy + 5, 2, 1, skin); }
  else { P(hx + 4, hy + 3, 4, 1, d.hair); P(hx + 9, hy + 3, 4, 1, d.hair); }
  if (d.glasses) { P(hx + 3, hy + 4, 11, 1, '#000'); P(hx + 4, hy + 4, 4, 4, 'rgba(120,220,255,.55)'); P(hx + 9, hy + 4, 4, 4, 'rgba(120,220,255,.55)'); }
  if (d.faceInk) {
    P(hx + 13, hy + 3, 1, 6, '#62454b');
    P(hx + 12, hy + 4, 1, 1, '#62454b');
    P(hx + 11, hy + 7, 2, 1, '#62454b');
    P(hx + 12, hy + 9, 1, 1, '#62454b');
  }
  if (d.beard === 'chinstrap') {
    P(hx + 1, hy + 7, 1, 5, d.hair);
    P(hx + 2, hy + 11, 2, 2, d.hair);
    P(hx + 4, hy + 12, 8, 2, d.hair);
    P(hx + 12, hy + 10, 1, 3, d.hair);
  }
  if (d.beard === 'saltPepper') {
    P(hx + 1, hy + 6, 3, 7, '#4c403b');
    P(hx + 2, hy + 9, 12, 6, '#625b52');
    P(hx + 5, hy + 14, 7, 2, '#7e746a');
    P(hx + 4, hy + 11, 2, 3, '#a09a8c');
    P(hx + 8, hy + 12, 1, 4, '#a7a395');
    P(hx + 11, hy + 10, 2, 3, '#8b857b');
    P(hx + 6, hy + 8, 7, 1, '#493b34');
  }
  if (d.beard === 'full') { P(hx + 2, hy + 8, 12, 6, d.hair); P(hx + 1, hy + 6, 2, 4, d.hair); }
  if (d.beard === 'long') {
    P(hx - 1, hy + 6, 3, 7, d.hair);
    P(hx + 13, hy + 7, 2, 7, d.hair);
    P(hx + 1, hy + 9, 13, 7, d.hair);
    P(hx + 3, hy + 14, 10, 4, d.hair);
    P(hx + 5, hy + 18, 6, 1, d.hair);
    P(hx + 3, hy + 12, 1, 4, '#695044');
    P(hx + 5, hy + 14, 2, 2, '#50413a');
    P(hx + 8, hy + 15, 1, 3, '#766052');
    P(hx + 11, hy + 12, 1, 4, '#58433a');
    P(hx + 5, hy + 8, 4, 1, '#251b18');
    P(hx + 9, hy + 8, 4, 1, '#251b18');
  }
  if (d.beard === 'stubble') { c.globalAlpha = 0.35; P(hx + 3, hy + 9, 11, 4, '#222'); c.globalAlpha = 1; }
  switch (mouth) {
    case 'neutral': P(hx + 8, hy + 10, 4, 1, '#5a1a1a'); break;
    case 'shout': P(hx + 7, hy + 9, 5, 3, '#3a0a0a'); P(hx + 8, hy + 9, 3, 1, '#fff'); break;
    case 'ouch': P(hx + 8, hy + 9, 3, 3, '#3a0a0a'); break;
    case 'chew': P(hx + 8, hy + 9, 4, 2, '#5a1a1a'); P(hx + 12, hy + 9, 2, 2, skin); break;
    case 'frown': P(hx + 7, hy + 10, 5, 1, '#3a0a0a'); P(hx + 6, hy + 11, 1, 1, '#3a0a0a'); P(hx + 12, hy + 11, 1, 1, '#3a0a0a'); break;
    case 'smile': P(hx + 6, hy + 9, 7, 3, '#3a0a0a'); P(hx + 7, hy + 9, 5, 1, '#fff'); break;
  }
  if (d.beard === 'mustache') P(hx + 6, hy + 8, 8, 2, d.hair);
  if (d.goldTooth && (mouth === 'shout' || mouth === 'smile' || mouth === 'neutral')) P(hx + 10, hy + 10, 1, 1, '#ffd700');

  // hat
  if (d.hat === 'laurel') {
    P(hx - 1, hy - 4, 15, 5, '#272b32');
    P(hx + 1, hy - 6, 11, 2, '#353945');
    P(hx + 4, hy - 7, 6, 1, '#474a52');
    P(hx - 1, hy - 1, 16, 2, '#181c25');
    P(hx, hy - 1, 13, 1, '#8e6428');
    for (const [x, y] of [[0, -3], [3, -2], [6, -3], [9, -2], [12, -3]]) {
      P(hx + x, hy + y, 2, 2, d.accent);
      P(hx + x + 1, hy + y - 1, 1, 1, '#f7dc76');
    }
  } else if (o.doppi || d.hat === 'doppi') {
    P(hx + 1, hy - 5, 12, 5, '#111'); P(hx + 2, hy - 6, 10, 1, '#111');
    for (let i = 0; i < 4; i++) { P(hx + 2 + i * 3, hy - 2, 2, 1, '#fff'); P(hx + 3 + i * 3, hy - 4, 1, 1, '#fff'); }
  } else switch (d.hat) {
    case 'embroideredCap':
      P(hx, hy - 4, 14, 5, '#24232e');
      P(hx + 2, hy - 5, 10, 2, '#55505d');
      P(hx + 1, hy - 1, 12, 1, '#8f918c');
      for (let x = 2; x < 12; x += 3) P(hx + x, hy - 3, 2, 1, '#ded6c7');
      break;
    case 'backCap':
      P(hx - 1, hy - 4, 15, 5, '#232632');
      P(hx + 1, hy - 5, 10, 2, '#3a3e49');
      P(hx - 4, hy - 1, 5, 2, '#272a36');
      P(hx + 3, hy - 1, 6, 1, '#575b63');
      break;
    case 'cap': P(hx, hy - 3, 14, 4, d.hatColor); P(hx + 10, hy, 8, 2, shade(d.hatColor, 0.7)); break;
    case 'chef': P(hx + 1, hy - 9, 12, 9, '#fff'); P(hx - 1, hy - 11, 16, 5, '#fff'); P(hx + 1, hy - 1, 12, 1, '#ccc'); break;
    case 'scarf': P(hx - 1, hy - 2, 16, 4, d.hatColor); P(hx - 1, hy + 2, 3, 5, d.hatColor); P(hx + 3, hy - 1, 2, 2, '#fff'); P(hx + 8, hy - 1, 2, 2, '#fff'); break;
    case 'hood': P(hx - 2, hy - 3, 15, 4, d.hatColor); P(hx - 2, hy, 3, 9, d.hatColor); break;
    case 'band': P(hx, hy + 1, 15, 2, d.accent); P(hx - 3, hy + 1, 3, 2, d.accent); P(hx - 4, hy + 3, 2, 3, d.accent); break;
  }

  arm(aF, 4 + lean, -43 + by, false);
  c.restore();
}

// ---------- props ----------
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }

function drawPlov(c, x, y) { // plate centre-bottom
  R(c, x - 9, y - 3, 18, 3, '#eee'); R(c, x - 7, y - 1, 14, 1, '#1e5aa8');
  R(c, x - 7, y - 6, 14, 3, '#e8b23a'); R(c, x - 5, y - 8, 10, 2, '#f0c24f'); R(c, x - 3, y - 9, 6, 1, '#f0c24f');
  R(c, x - 4, y - 7, 2, 1, '#e67e22'); R(c, x + 2, y - 6, 2, 1, '#e67e22'); R(c, x, y - 8, 2, 1, '#e67e22');
  R(c, x - 1, y - 10, 3, 2, '#6b3a1e'); R(c, x + 4, y - 7, 1, 1, '#333');
}
function drawTeapot(c, x, y) { // centre
  R(c, x - 5, y - 4, 10, 8, '#fff'); R(c, x - 6, y - 2, 12, 5, '#fff'); R(c, x - 3, y - 6, 6, 2, '#1e5aa8'); R(c, x - 1, y - 7, 2, 1, '#e8c547');
  R(c, x + 6, y - 2, 3, 2, '#fff'); R(c, x + 8, y - 4, 2, 2, '#fff'); R(c, x - 9, y - 2, 3, 1, '#fff'); R(c, x - 9, y - 2, 1, 4, '#fff'); R(c, x - 9, y + 2, 3, 1, '#fff');
  R(c, x - 3, y - 1, 2, 2, '#1e5aa8'); R(c, x + 1, y - 1, 2, 2, '#1e5aa8'); R(c, x - 1, y + 1, 2, 2, '#e8c547');
}
function drawMelon(c, x, y, rot) {
  R(c, x - 7, y - 4, 14, 8, '#e8c84a'); R(c, x - 5, y - 6, 10, 12, '#e8c84a');
  const k = Math.floor(rot) % 3;
  for (let i = -4 + k; i < 6; i += 3) R(c, x + i, y - 5, 1, 10, '#b8962a');
  R(c, x - 3, y - 4, 2, 2, '#fff7b0');
}
function drawSomsa(c, x, y) {
  R(c, x - 5, y + 1, 10, 3, '#c98a3a'); R(c, x - 4, y - 1, 8, 2, '#d99a4a'); R(c, x - 2, y - 3, 4, 2, '#e3aa5a'); R(c, x - 1, y - 1, 1, 1, '#111'); R(c, x + 1, y, 1, 1, '#111');
  R(c, x - 8, y, 2, 1, '#f60'); R(c, x - 10, y + 1, 2, 1, '#fa0');
}
function drawDamas(c, x, y, face, t) { // small white minivan, centre-bottom
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(face, 1);
  const P = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
  P(-24, -30, 46, 24, '#f2f2f2'); P(-22, -34, 40, 4, '#f2f2f2'); P(22, -22, 5, 16, '#f2f2f2');
  P(-24, -10, 51, 4, '#bbb'); P(8, -28, 13, 10, '#7fc8f8'); P(-8, -28, 13, 10, '#7fc8f8'); P(-21, -28, 10, 10, '#7fc8f8');
  P(24, -18, 3, 4, '#ffe066'); P(-24, -16, 2, 4, '#e74c3c'); P(-6, -17, 1, 11, '#999'); P(-2, -15, 3, 1, '#666');
  const w = Math.floor(t * 20) % 2;
  P(-18, -8, 10, 8, '#111'); P(10, -8, 10, 8, '#111'); P(-15 + w, -5, 4, 3, '#888'); P(13 + w, -5, 4, 3, '#888');
  P(-12, -24, 4, 4, '#2b2b2b'); P(12, -24, 4, 4, '#d9a066');
  c.restore();
}
function drawFlag(c, x, y, w, h, t, flat) { // flag of Uzbekistan, waving
  const s = h / 3;
  for (let i = 0; i < w; i++) {
    const dy = flat ? 0 : Math.round(Math.sin(t * 6 + i * 0.5) * 1.5 * (i / w));
    R(c, x + i, y + dy, 1, Math.ceil(s), '#0099b5');
    R(c, x + i, y + dy + s, 1, Math.ceil(s), '#fff');
    R(c, x + i, y + dy + s * 2, 1, Math.ceil(h - 2 * s), '#1eb53a');
    if (h >= 12) { R(c, x + i, y + dy + s - 1, 1, 1, '#ce1126'); R(c, x + i, y + dy + 2 * s, 1, 1, '#ce1126'); }
  }
  if (h >= 12) { R(c, x + 3, y + 2, 2, 3, '#fff'); R(c, x + 2, y + 3, 1, 1, '#fff'); for (let i = 0; i < 3; i++) R(c, x + 7 + i * 2, y + 2 + (i % 2), 1, 1, '#fff'); }
  else R(c, x + 1, y + 1, 1, 1, '#fff');
}
function madrasa(c, x, w, h, base) {
  const y = base - h;
  R(c, x, y, w, h, '#d9b77a'); R(c, x, y, w, 3, '#19a7a8'); R(c, x, y + 3, w, 1, '#0d5c75');
  for (let i = 2; i < w - 2; i += 4) R(c, x + i, y + 6, 2, 2, (i / 4) % 2 ? '#19a7a8' : '#1e5aa8');
  const pw = Math.floor(w * 0.4), pxx = x + Math.floor((w - pw) / 2);
  R(c, pxx, y + 14, pw, h - 14, '#3b2a4a');
  for (let k = 0; k < pw / 2; k++) R(c, pxx + k, y + 14, 1, Math.max(0, Math.floor(pw / 2 - k)), '#d9b77a'), R(c, pxx + pw - 1 - k, y + 14, 1, Math.max(0, Math.floor(pw / 2 - k)), '#d9b77a');
  R(c, pxx - 2, y + 12, pw + 4, 2, '#1e5aa8');
  for (let s = 0; s < 2; s++) for (let r = 0; r < 2; r++) {
    const ax = s ? x + w - 14 : x + 6, ay = y + 18 + r * Math.floor((h - 22) / 2);
    R(c, ax, ay, 8, 12, '#3b2a4a'); R(c, ax, ay, 8, 1, '#19a7a8'); R(c, ax, ay, 2, 2, '#d9b77a'); R(c, ax + 6, ay, 2, 2, '#d9b77a');
  }
  for (const mx of [x - 7, x + w + 1]) {
    R(c, mx, y - 18, 6, h + 18, '#cfa967'); R(c, mx - 1, y - 20, 8, 3, '#19a7a8'); R(c, mx + 1, y - 24, 4, 4, '#19a7a8'); R(c, mx + 2, y - 26, 2, 2, '#19a7a8');
    for (let j = 0; j < h + 10; j += 8) R(c, mx, y - 10 + j, 6, 1, '#1e5aa8');
  }
}
function dome(c, cx, base, r, col) {
  for (let i = -r; i <= r; i++) {
    const hh = Math.round(Math.sqrt(r * r - i * i) * 1.15);
    R(c, cx + i, base - hh, 1, hh, (Math.abs(i) % 4 === 0) ? shade(col, 0.75) : col);
  }
  R(c, cx - r - 1, base, 2 * r + 2, 4, '#d9b77a'); R(c, cx - 1, base - Math.round(r * 1.15) - 5, 2, 5, '#f1c40f');
}
function sky(c, stops) {
  const g = c.createLinearGradient(0, 0, 0, FLOOR - 20);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function floorTiles(c, a, b) {
  R(c, 0, FLOOR - 26, W, H - FLOOR + 26, a);
  for (let j = 0; j < 6; j++) { const yy = FLOOR - 26 + j * j * 2; R(c, 0, yy, W, 1, b); }
  for (let i = -10; i < 30; i++) { c.strokeStyle = b; c.beginPath(); c.moveTo(240 + (i - 10) * 26, FLOOR - 26); c.lineTo(240 + (i - 10) * 60, H); c.stroke(); }
}
function crowd(c, y, n, seed) {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const cols = ['#c0392b', '#1f6f8b', '#8e44ad', '#27ae60', '#d35400', '#f4f4f4', '#2c3e50'];
  for (let i = 0; i < n; i++) {
    const x = 6 + i * (W / n) + rnd() * 6, yy = y + Math.floor(rnd() * 5);
    R(c, x - 3, yy + 6, 8, 14, cols[Math.floor(rnd() * cols.length)]);
    R(c, x - 2, yy, 6, 6, ['#d9a066', '#c68642', '#e0ac69'][Math.floor(rnd() * 3)]);
    if (rnd() < 0.6) { R(c, x - 2, yy - 2, 6, 2, '#111'); R(c, x, yy - 2, 1, 1, '#fff'); }
    else R(c, x - 2, yy - 1, 6, 2, '#2a1a10');
  }
}

const STAGES = [
  { name: 'REGISTON SUNSET', draw(c) {
    sky(c, ['#2b1055', '#7d2a6b', '#e2582b', '#ffc15e']);
    c.fillStyle = '#fff1a8'; c.beginPath(); c.arc(240, 150, 46, 0, 7); c.fill();
    c.fillStyle = '#5a2d5c'; for (let i = 0; i < W; i += 2) R(c, i, 170 - Math.round(Math.sin(i * 0.02) * 14 + Math.sin(i * 0.07) * 6), 2, 60, '#5a2d5c');
    dome(c, 62, 128, 22, '#19a7a8'); dome(c, 418, 128, 22, '#19a7a8'); dome(c, 300, 108, 16, '#1e5aa8');
    madrasa(c, 20, 110, 84, FLOOR - 26); madrasa(c, 180, 120, 104, FLOOR - 26); madrasa(c, 350, 110, 84, FLOOR - 26);
    crowd(c, FLOOR - 44, 34, 7);
    floorTiles(c, '#c9a36a', '#a07c48');
  } },
  { name: 'CHORSU BOZOR', draw(c) {
    sky(c, ['#3aa0e8', '#8fd3ff', '#e8f6ff']);
    for (const [x, y] of [[60, 30], [200, 20], [380, 40]]) { R(c, x, y, 40, 8, '#fff'); R(c, x + 8, y - 5, 22, 6, '#fff'); }
    dome(c, 240, 150, 120, '#1a8fa0');
    for (let i = 0; i < 14; i++) R(c, 135 + i * 16, 150, 8, 14, '#0d5c75');
    R(c, 0, 150, W, 70, '#b98d5a'); R(c, 0, 150, W, 3, '#7a5a34');
    for (let i = 0; i < 6; i++) {
      const x = 4 + i * 80, col = ['#e74c3c', '#27ae60', '#f39c12', '#2980b9', '#8e44ad', '#e74c3c'][i];
      for (let k = 0; k < 72; k += 8) { R(c, x + k, 158, 4, 12, col); R(c, x + k + 4, 158, 4, 12, '#fff'); }
      R(c, x, 170, 2, 42, '#5a3d1e'); R(c, x + 70, 170, 2, 42, '#5a3d1e'); R(c, x, 192, 72, 20, '#7a5a34');
      for (let m = 0; m < 5; m++) {
        if (i % 3 === 0) drawMelon(c, x + 10 + m * 13, 187, m);
        else if (i % 3 === 1) { R(c, x + 5 + m * 13, 181, 11, 10, '#1e8449'); R(c, x + 7 + m * 13, 181, 2, 10, '#145a32'); R(c, x + 12 + m * 13, 181, 2, 10, '#145a32'); }
        else { R(c, x + 4 + m * 13, 180, 11, 12, '#e8dcc0'); R(c, x + 6 + m * 13, 178, 7, 3, ['#f0c24f', '#c0392b', '#f5f5f5', '#8d6e63', '#f39c12'][m]); }
      }
    }
    for (let i = 0; i < W; i += 14) { R(c, i, 140 + Math.round(Math.sin(i * 0.06) * 3), 1, 4, '#333'); R(c, i - 1, 144 + Math.round(Math.sin(i * 0.06) * 3), 3, 3, ['#f1c40f', '#e74c3c', '#2ecc71'][(i / 14) % 3]); }
    crowd(c, FLOOR - 42, 26, 21);
    floorTiles(c, '#8c8c8c', '#6f6f6f');
  } },
  { name: 'MAHALLA NIGHT', draw(c) {
    sky(c, ['#050a24', '#12204a', '#2a3a6e']);
    let s = 5; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) R(c, rnd() * W, rnd() * 120, 1, 1, '#fff');
    c.fillStyle = '#fff6c9'; c.beginPath(); c.arc(390, 46, 18, 0, 7); c.fill(); c.fillStyle = '#0b1535'; c.beginPath(); c.arc(398, 41, 16, 0, 7); c.fill();
    R(c, 0, 120, W, 100, '#c9b79a'); R(c, 0, 116, W, 5, '#8d5a3a');
    for (let i = 0; i < W; i += 12) R(c, i, 112, 10, 5, i % 24 ? '#a8623c' : '#8d4a2a');
    for (const x of [30, 120, 330, 420]) { R(c, x, 140, 26, 30, '#3a2a1a'); R(c, x + 2, 142, 22, 26, '#ffd76a'); R(c, x + 12, 142, 2, 26, '#3a2a1a'); R(c, x + 2, 154, 22, 2, '#3a2a1a'); }
    R(c, 200, 126, 80, 90, '#1e5aa8'); R(c, 196, 122, 88, 5, '#0d3b75'); R(c, 239, 126, 2, 90, '#0d3b75');
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { R(c, 208 + i * 42, 134 + j * 27, 22, 20, '#2f6fc0'); R(c, 216 + i * 42, 141 + j * 27, 6, 6, '#f1c40f'); }
    R(c, 150, 60, 8, 160, '#4a3320'); for (const [x, y, r] of [[154, 60, 30], [130, 76, 20], [180, 72, 22]]) { c.fillStyle = '#1e6b3a'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    R(c, 0, 100, W, 1, '#111'); for (let i = 20; i < W; i += 46) { R(c, i, 101, 1, 5, '#111'); R(c, i - 1, 106, 3, 4, '#ffe066'); }
    // tapchan with teapot
    R(c, 36, 196, 86, 6, '#7a4a24'); R(c, 40, 202, 4, 16, '#5a3418'); R(c, 114, 202, 4, 16, '#5a3418'); R(c, 36, 178, 3, 18, '#7a4a24'); R(c, 119, 178, 3, 18, '#7a4a24'); R(c, 36, 178, 86, 3, '#7a4a24');
    R(c, 44, 191, 70, 5, '#c0392b'); for (let i = 46; i < 112; i += 6) R(c, i, 192, 3, 2, '#f1c40f');
    drawTeapot(c, 80, 185); drawPlov(c, 100, 191);
    drawDamas(c, 400, 222, -1, 0);
    R(c, 0, FLOOR - 26, W, H, '#5b4a3a');
    for (let i = 0; i < 160; i++) R(c, rnd() * W, FLOOR - 24 + rnd() * 54, 2, 1, rnd() < 0.5 ? '#4a3b2d' : '#6d5a47');
  } }
];
// courtyard arena from an image file (assets/arena.png, 480x270)
const ARENA_IMG = new Image();
ARENA_IMG.src = 'assets/arena.png';
STAGES.push({ name: 'HOVLI', img: true, draw(c) { c.drawImage(ARENA_IMG, 0, 0, W, H); } });
const stageCache = [];
function getStage(i) {
  if (STAGES[i].img && !(ARENA_IMG.complete && ARENA_IMG.naturalWidth)) return getStage(0); // image missing: fall back
  if (!stageCache[i]) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.lineWidth = 1;
    STAGES[i].draw(c); stageCache[i] = cv;
  }
  return stageCache[i];
}

// canvas text with outline
function txt(c, s, x, y, col, size, align) {
  c.font = (size || 8) + 'px "Press Start 2P", "Courier New", monospace';
  c.textAlign = align || 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#000';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) c.fillText(s, Math.round(x) + dx, Math.round(y) + dy);
  c.fillStyle = col || '#fff'; c.fillText(s, Math.round(x), Math.round(y));
}
