// ===== Mortal Kompot: screens, menus, main loop =====
(() => {
  const $ = id => document.getElementById(id);
  const wrap = $('wrap'), cv = $('cv'), c = cv.getContext('2d');
  const menuBackground = $('menu-bg');
  const previewCanvases = [$('pv0'), $('pv1')];
  c.imageSmoothingEnabled = false;
  let screen = 'title', t = 0, last = performance.now(), paused = false;
  let mode = 'cpu', difficulty = 'normal', matchType = 'classic', picks = [null, null];
  let quitOpen = false, mood = null;

  function show(name) {
    if ((screen === 'select' || screen === 'fight') && name !== screen) AudioSys.stopFighter();
    Input.activate(name === 'fight');
    document.querySelectorAll('.screen').forEach(e => e.classList.toggle('hidden', e.id !== 's-' + name));
    const inMatch = name === 'fight' || name === 'pause' || name === 'end';
    cv.classList.toggle('hidden', !inMatch);
    menuBackground.classList.toggle('hidden', inMatch);
    screen = name;
  }
  function resize() { wrap.style.fontSize = (wrap.clientWidth / 62) + 'px'; }
  window.addEventListener('resize', resize); resize();

  document.querySelectorAll('button').forEach(b => {
    b.addEventListener('mouseenter', () => AudioSys.sfx('hover'));
    b.addEventListener('click', () => AudioSys.sfx('blip'));
  });

  // ---------- start / title ----------
  document.addEventListener('click', function startAudio(event) {
    if (!event.target.closest('button')) return;
    AudioSys.init();
    AudioSys.music('menu');
    document.removeEventListener('click', startAudio, true);
  }, true);
  function toTitle() { Game.stop(); paused = false; AudioSys.music('menu'); show('title'); }
  $('b-1p').onclick = () => { AudioSys.sfx('letsgo'); show('difficulty'); };
  for (const level of ['easy', 'normal', 'hard']) {
    $('b-' + level).onclick = () => { difficulty = level; openSelect('cpu'); };
  }
  $('b-diffback').onclick = () => { show('title'); };
  $('b-2p').onclick = () => { AudioSys.sfx('confirm'); AudioSys.sfx('horn'); AudioSys.announce('Two players. One keyboard. No mercy.'); openSelect('pvp'); };
  $('b-set').onclick = () => { openSettings(); };

  // ---------- quit modal ----------
  const react = $('qreact');
  function setMood(m) {
    mood = m;
    react.className = 'react ' + (m === 'angry' ? 'bad' : m === 'happy' ? 'good' : '');
    react.innerHTML = m === 'angry' ? 'NO PILAV' : m === 'happy' ? '+KVARTIRA V TASHKENTE' : '&nbsp;';
  }
  $('b-quit').onclick = () => { AudioSys.sfx('boom'); quitOpen = true; setMood(null); $('m-quit').classList.remove('hidden'); };
  $('b-qyes').onmouseenter = () => { setMood('angry'); AudioSys.sfx('boom'); };
  $('b-qno').onmouseenter = () => { setMood('happy'); AudioSys.sfx('confirm'); };
  $('b-qyes').onmouseleave = $('b-qno').onmouseleave = () => setMood(null);
  $('b-qno').onclick = () => { quitOpen = false; $('m-quit').classList.add('hidden'); AudioSys.sfx('horn'); AudioSys.say('Kvartira v Tashkente!', { pitch: 1.4, rate: 1.1, cut: true }); };
  $('b-qyes').onclick = () => {
    quitOpen = false; $('m-quit').classList.add('hidden'); AudioSys.sfx('sad'); AudioSys.music(null); AudioSys.announce('No pilav');
    show('bye'); setTimeout(() => { try { window.close(); } catch (e) { /* tab stays */ } }, 1800);
  };
  $('b-sorry').onclick = () => { AudioSys.sfx('confirm'); toTitle(); };
  const pcv = $('patriot'), pc = pcv.getContext('2d'); pc.imageSmoothingEnabled = false;
  function drawPatriot() {
    pc.clearRect(0, 0, 80, 84);
    R(pc, 55, 6, 2, 76, '#ccc'); R(pc, 54, 4, 4, 3, '#ffd54a');
    drawFlag(pc, 57, 8, 22, 14, t);
    const shakeX = mood === 'angry' ? Math.round(Math.sin(t * 40)) : 0, hop = mood === 'happy' ? Math.round(Math.abs(Math.sin(t * 8)) * 4) : 0;
    drawFighter(pc, PATRIOT, 30 + shakeX, 82 - hop, 1, mood === 'happy' ? 'jump' : 'idle', t, { mood, flagPatch: true });
    if (mood === 'angry') { R(pc, 8, 14, 2, 8, '#ff3d3d'); R(pc, 5, 17, 8, 2, '#ff3d3d'); }
    if (mood === 'happy') { drawPlov(pc, 12, 20 - hop); }
  }

  // ---------- character select ----------
  const grid = $('grid'), icons = [];
  FIGHTERS.forEach((d, i) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.title = d.name === d.short ? d.name : d.name + ' · ' + d.short;
    tile.setAttribute('aria-label', d.name);
    tile.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img');
    image.src = d.portrait;
    image.alt = '';
    tile.appendChild(image);
    tile.onmouseenter = () => AudioSys.sfx('hover');
    tile.onclick = () => pick(i);
    grid.appendChild(tile);
    icons.push(tile);
  });
  const pv = previewCanvases.map(canvas => canvas.getContext('2d'));
  pv.forEach(g => g.imageSmoothingEnabled = false);

  function openSelect(m) {
    AudioSys.stopFighter();
    mode = m; picks = [null, null];
    $('ptag1').textContent = m === 'cpu' ? 'CPU / ' + difficulty.toUpperCase() : 'PLAYER 2';
    refreshSelect(); show('select');
  }
  function refreshSelect() {
    for (let p = 0; p < 2; p++) {
      const d = FIGHTERS[picks[p]];
      $('pn' + p).textContent = d ? d.short : '???';
      $('ps' + p).textContent = d ? d.style : '';
      $('pb' + p).textContent = d ? d.bio : '';
    }
    icons.forEach((tile, i) => {
      tile.classList.toggle('s0', picks[0] === i);
      tile.classList.toggle('s1', picks[1] === i);
      tile.setAttribute('aria-pressed', String(picks.includes(i)));
    });
    const empty = picks.indexOf(null);
    $('b-continue').classList.toggle('hidden', empty !== -1);
    $('selinfo').textContent = empty === 0 ? 'PLAYER 1: PICK YOUR FIGHTER'
      : empty === 1 ? (mode === 'cpu' ? 'PICK THE CPU FIGHTER' : 'PLAYER 2: PICK YOUR FIGHTER')
      : 'CLICK A SELECTED FIGHTER TO DESELECT';
  }
  function pick(i) {
    if (screen !== 'select') return;
    const selected = picks.indexOf(i);
    if (selected !== -1) {
      picks[selected] = null;
      AudioSys.stopFighter();
    } else {
      const empty = picks.indexOf(null);
      if (empty === -1) return;
      picks[empty] = i;
      AudioSys.playFighter(FIGHTERS[i].selectSound, 'select');
    }
    refreshSelect();
  }
  function backFromSelect() { show(mode === 'cpu' ? 'difficulty' : 'title'); }
  $('b-selback').onclick = backFromSelect;
  $('b-continue').onclick = () => { if (!picks.includes(null)) show('mode'); };
  $('b-modeback').onclick = () => { show('select'); };
  $('b-classic').onclick = () => { startFight('classic'); };
  $('b-endless').onclick = () => { startFight('endless'); };

  function drawPreview(p) {
    const g = pv[p];
    g.fillStyle = '#141c33'; g.fillRect(0, 0, 72, 96);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#1b2644' : '#18213b'; g.fillRect(0, i * 16 + (Math.floor(t * 20) % 16) - 16, 72, 8); }
    if (picks[p] == null) { txt(g, '?', 36, 50, '#555', 32); return; }
    const d = FIGHTERS[picks[p]], poses = ['idle', 'idle', 'punch', 'idle', 'kick', 'idle', 'throw', 'block', 'tea', 'win'];
    const pose = poses[Math.floor(t * 1.4 + p * 3) % poses.length];
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(16, 86, 40, 4);
    drawFighter(g, d, 30, 88, p ? -1 : 1, pose, t, { doppi: pose === 'tea' });
    if (pose === 'win') drawPlov(g, 30 + (p ? -22 : 22), 88);
  }
  function startFight(type) {
    if (picks.includes(null)) return;
    matchType = type;
    paused = false; show('fight');
    AudioSys.sfx('confirm');
    Game.start(FIGHTERS[picks[0]], FIGHTERS[picks[1]], { mode, difficulty, matchType }, () => show('end'));
  }
  $('b-rematch').onclick = () => { startFight(matchType); };
  $('b-change').onclick = () => { Game.stop(); AudioSys.music('menu'); openSelect(mode); };
  $('b-emenu').onclick = $('b-pmenu').onclick = () => { AudioSys.sfx('back'); toTitle(); };
  $('b-resume').onclick = () => { paused = false; show('fight'); };

  window.addEventListener('keydown', e => {
    if (e.code === 'Escape') {
      if (screen === 'fight') { paused = true; show('pause'); AudioSys.sfx('slurp'); }
      else if (screen === 'pause') { paused = false; show('fight'); }
      else if (quitOpen) $('b-qno').click();
      else if (screen === 'mode') show('select');
      else if (screen === 'select') backFromSelect();
      else if (screen === 'settings' || screen === 'difficulty') show('title');
    }
    if (e.code === 'Enter' && screen === 'select' && !picks.includes(null) && !e.target.closest?.('button')) show('mode');
  });

  // ---------- settings ----------
  const LABEL = { left: 'LEFT', right: 'RIGHT', up: 'JUMP', down: 'CROUCH', punch: 'PUNCH', kick: 'KICK', special: 'SPECIAL', block: 'BLOCK', super: 'SUPER (CHOY)' };
  function renderKeys() {
    const tb = $('keys'); tb.innerHTML = '<tr><th></th><th>P1</th><th>P2</th></tr>';
    for (const a of ACTIONS) {
      const tr = document.createElement('tr'); tr.innerHTML = '<td style="text-align:left">' + LABEL[a] + '</td>';
      for (let p = 0; p < 2; p++) {
        const td = document.createElement('td'); td.className = 'k'; td.textContent = Input.label(Input.keys[p][a]);
        td.onclick = () => {
          AudioSys.sfx('blip'); td.textContent = 'PRESS...'; td.classList.add('wait');
          Input.captureNext(code => { if (code !== 'Escape') { Input.keys[p][a] = code; Input.save(); } AudioSys.sfx('confirm'); renderKeys(); });
        };
        tr.appendChild(td);
      }
      tb.appendChild(tr);
    }
  }
  const volumes = [
    { slider: $('r-music'), max: AudioSys.MUSIC_MAX, get: () => AudioSys.musicVol, set: AudioSys.setMusic },
    { slider: $('r-sfx'), max: 1, get: () => AudioSys.sfxVol, set: AudioSys.setSfx },
    { slider: $('r-fighters'), max: 1, get: () => AudioSys.fighterVol, set: AudioSys.setFighterVolume }
  ];
  function openSettings() {
    for (const { slider, get, max } of volumes) {
      slider.value = Math.round(get() / max * 100);
      slider.style.setProperty('--level', slider.value + '%');
    }
    $('c-voice').checked = AudioSys.voiceOn;
    $('uzmsg').textContent = ''; renderKeys(); show('settings');
  }
  for (const { slider, set, max } of volumes) {
    slider.oninput = () => {
      slider.style.setProperty('--level', slider.value + '%');
      set(slider.value / 100 * max);
    };
  }
  $('r-sfx').onchange = () => AudioSys.sfx('hit');
  $('c-voice').onchange = e => { AudioSys.setVoice(e.target.checked); if (e.target.checked) AudioSys.announce('Voice on'); };
  $('b-keyreset').onclick = () => { Input.reset(); renderKeys(); };
  $('b-setback').onclick = () => { AudioSys.sfx('back'); show('title'); };
  $('b-uzyes').onclick = () => {
    AudioSys.sfx('horn'); AudioSys.say('True Uzbek confirmed!', { pitch: 0.3, rate: 0.8, cut: true });
    $('uzmsg').innerHTML = 'TRUE UZBEK CONFIRMED &#10004;<br>+1 OSH.';
  };
  $('b-uzno').onclick = () => {
    AudioSys.sfx('boom');
    $('uzmsg').innerHTML = 'NO PROBLEM, MEHMON.<br>EAT PLOV 3 TIMES A DAY AND TRY AGAIN.';
  };

  // ---------- main loop ----------
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now; t += dt;
    if (screen === 'fight' || screen === 'end' || screen === 'pause') {
      if (!paused) Game.update(dt);
      Game.draw(c);
    } else {
      if (screen === 'select') { drawPreview(0); drawPreview(1); }
      if (quitOpen) drawPatriot();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // small hook for automated testing
  window.__mk = { show, openSelect, pick, startFight, get screen() { return screen; } };
})();
