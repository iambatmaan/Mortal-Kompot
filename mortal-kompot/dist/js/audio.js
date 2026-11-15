// ===== Mortal Kompot: soundtrack, sound effects, and announcer =====
const AudioSys = (() => {
  let ac = null, sg;
  const MUSIC_MAX = 0.35;
  let musicVol = 0.09, sfxVol = 0.6, fighterVol = 1, voiceOn = true;
  let clipMode = null, playback = 0;
  const soundtrack = new Audio('assets/techno-syndrome.mp3');
  soundtrack.loop = true;
  soundtrack.preload = 'none';
  soundtrack.volume = musicVol;

  const fighterClip = new Audio();
  fighterClip.preload = 'none';
  fighterClip.volume = fighterVol;
  fighterClip.addEventListener('ended', () => { if (fighterClip.ended) stopFighter(); });
  fighterClip.addEventListener('error', () => { if (fighterClip.error) stopFighter(); });

  function syncMix() {
    soundtrack.muted = clipMode === 'select';
    soundtrack.volume = musicVol * (clipMode === 'fight' ? 0.25 : 1);
    if (sg) sg.gain.value = sfxVol * (clipMode === 'select' ? 0 : clipMode === 'fight' ? 0.45 : 1);
  }

  function playFighter(src, mode) {
    if (!src || fighterVol === 0 || (mode === 'fight' && clipMode)) return false;
    const request = ++playback;
    if (fighterClip.getAttribute('src') !== src) fighterClip.src = src;
    fighterClip.currentTime = 0;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clipMode = mode;
    syncMix();
    fighterClip.play().catch(error => {
      if (request !== playback) return;
      stopFighter();
      if (error.name !== 'AbortError') console.warn('Fighter audio failed.', error);
    });
    return true;
  }

  function stopFighter() {
    playback++;
    fighterClip.pause();
    clipMode = null;
    syncMix();
  }

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    sg = ac.createGain();
    sg.connect(ac.destination);
    syncMix();
  }

  function tone(f, f2, d, type, v, when) {
    if (!ac) return;
    const t = (when || ac.currentTime), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(Math.max(1, f), t);
    if (f2 && f2 !== f) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v || 0.3, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(sg);
    o.start(t); o.stop(t + d + 0.02);
  }

  let noiseBuf = null;
  function noise(d, v, freq, ftype, when) {
    if (!ac) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    const t = (when || ac.currentTime), s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true;
    fl.type = ftype || 'lowpass'; fl.frequency.value = freq || 1500;
    g.gain.setValueAtTime(v || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(sg);
    s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }

  const now = () => ac ? ac.currentTime : 0;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  const SFX = {
    hit() { noise(0.09, 0.5, 1400); tone(170, 60, 0.11, 'square', 0.35); },
    heavy() { noise(0.16, 0.6, 900); tone(120, 38, 0.2, 'square', 0.45); },
    block() { tone(820, 560, 0.06, 'triangle', 0.3); noise(0.04, 0.2, 3000, 'highpass'); },
    whoosh() { noise(0.12, 0.18, 2200, 'bandpass'); },
    jump() { tone(280, 620, 0.11, 'square', 0.15); },
    blip() { tone(880, 880, 0.05, 'square', 0.18); },
    hover() { tone(520, 520, 0.03, 'square', 0.1); },
    confirm() { const t = now(); tone(660, 660, 0.07, 'square', 0.2, t); tone(990, 990, 0.12, 'square', 0.2, t + 0.07); },
    back() { const t = now(); tone(500, 500, 0.07, 'square', 0.2, t); tone(330, 330, 0.12, 'square', 0.2, t + 0.07); },
    boom() { tone(95, 30, 1.0, 'sine', 1.0); tone(60, 28, 0.8, 'triangle', 0.6); noise(0.3, 0.5, 220); },
    special() { tone(200, 1300, 0.25, 'sawtooth', 0.22); },
    superUp() { const t = now(); [62, 66, 69, 74, 78, 81].forEach((m, i) => tone(hz(m), hz(m), 0.14, 'square', 0.22, t + i * 0.07)); },
    slurp() { const t = now(); for (let i = 0; i < 4; i++) tone(300 + i * 60, 900 + i * 80, 0.1, 'sine', 0.25, t + 0.25 + i * 0.12); },
    eat() { const t = now(); for (let i = 0; i < 3; i++) noise(0.05, 0.25, 2500, 'bandpass', t + i * 0.09); },
    parry() { const t = now(); tone(550, 990, 0.09, 'triangle', 0.35, t); tone(1300, 1300, 0.13, 'sine', 0.2, t + 0.04); },
    beep() { tone(440, 440, 0.25, 'square', 0.25); tone(554, 554, 0.25, 'square', 0.25); },
    horn() {
      const t = now();
      [0, 0.14, 0.28].forEach((dt, i) => { const d = i === 2 ? 0.6 : 0.1;[466, 470, 587, 700].forEach(f => tone(f, f * 0.97, d, 'sawtooth', 0.14, t + dt)); });
    },
    ko() { tone(420, 45, 1.1, 'sawtooth', 0.35); SFX.boom(); },
    sad() { const t = now(); [58, 57, 56, 55].forEach((m, i) => tone(hz(m), hz(m) * 0.97, i === 3 ? 0.7 : 0.3, 'sawtooth', 0.2, t + i * 0.32)); },
    laugh() {
      const t = now();
      for (let i = 0; i < 6; i++) { tone(190 - i * 14, 130 - i * 10, 0.13, 'sawtooth', 0.35, t + i * 0.17); noise(0.08, 0.1, 700, 'bandpass', t + i * 0.17); }
    },
    gong() { tone(98, 96, 2.2, 'sine', 0.6); tone(147, 143, 1.6, 'triangle', 0.3); tone(261, 250, 1.0, 'sine', 0.15); noise(0.2, 0.2, 500); },
    // original "ancient warriors wake up" stinger for 1 PLAYER
    letsgo() {
      const t = now();
      const stab = (m, at, d) => { [0, 7, 12].forEach(iv => tone(hz(m + iv), hz(m + iv), d, 'sawtooth', 0.16, t + at)); tone(hz(m - 12), 30, 0.3, 'sine', 0.7, t + at); noise(0.12, 0.3, 500, 'lowpass', t + at); };
      stab(38, 0, 0.35); stab(38, 0.45, 0.2); stab(41, 0.68, 0.2); stab(43, 0.9, 0.5); stab(46, 1.45, 0.25); stab(45, 1.7, 0.9);
      tone(150, 1200, 0.9, 'sawtooth', 0.12, t + 1.7);
    }
  };

  function music(name) {
    if (!name) {
      soundtrack.pause();
      return;
    }
    if (soundtrack.paused) {
      soundtrack.play().catch(error => {
        if (error.name !== 'AbortError') console.warn('Soundtrack playback failed.', error);
      });
    }
  }

  // ---------- voice (browser speech synthesis) ----------
  function say(text, o) {
    o = o || {};
    if (!voiceOn || !window.speechSynthesis || clipMode) return;
    try {
      if (o.cut) speechSynthesis.cancel();
      else if (speechSynthesis.speaking) return;
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = o.pitch == null ? 1 : o.pitch; u.rate = o.rate == null ? 1 : o.rate;
      u.volume = Math.min(1, sfxVol * 1.3);
      speechSynthesis.speak(u);
    } catch (e) { /* voice is optional */ }
  }
  const announce = text => say(text, { pitch: 0.1, rate: 0.65, cut: true });

  return {
    init, music, say, announce, playFighter, stopFighter, MUSIC_MAX,
    sfx(n) { if (ac && clipMode !== 'select' && SFX[n]) SFX[n](); },
    setMusic(v) { musicVol = v; syncMix(); },
    setSfx(v) { sfxVol = v; syncMix(); },
    setFighterVolume(v) {
      fighterVol = v;
      fighterClip.volume = v;
      if (v === 0) stopFighter();
    },
    setVoice(b) { voiceOn = b; },
    get musicVol() { return musicVol; }, get sfxVol() { return sfxVol; },
    get fighterVol() { return fighterVol; }, get voiceOn() { return voiceOn; }
  };
})();
