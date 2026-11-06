/**
 * Audio helpers – cue tone + text-to-speech
 */

const AudioEngine = (() => {
  let voices = [];
  let voiceUS = null;
  let voiceGB = null;
  let audioCtx = null;

  function loadVoices() {
    try {
      if (!window.speechSynthesis) return;
      voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
      voiceGB = voices.find(v => /en-GB/i.test(v.lang) && /george|hazel|susan|uk|british/i.test(v.name)) ||
                voices.find(v => /en-GB/i.test(v.lang)) ||
                voices.find(v => /en-AU/i.test(v.lang));
      voiceUS = voices.find(v => /en-US/i.test(v.lang) && /david|zira|mark|us|american/i.test(v.name)) ||
                voices.find(v => /en-US/i.test(v.lang)) ||
                voices[0];
    } catch (e) {}
  }

  // Load voices when available
  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCueTone(token, currentToken) {
    return new Promise(resolve => {
      if (token !== currentToken) return resolve();
      try {
        const ctx = getAudioContext();
        if (!ctx) return resolve();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);

        setTimeout(() => {
          if (token === currentToken) resolve();
        }, 380);
      } catch (e) {
        resolve();
      }
    });
  }

  function speak(text, isBritish, pitch = 1, rate = 0.95, token, currentToken) {
    return new Promise(resolve => {
      if (!window.speechSynthesis || token !== currentToken) return resolve();
      if (speechSynthesis.paused) speechSynthesis.resume();

      const u = new SpeechSynthesisUtterance(text);
      const chosen = isBritish ? (voiceGB || voiceUS) : (voiceUS || voiceGB);
      if (chosen) {
        u.voice = chosen;
        u.lang = chosen.lang;
      } else {
        u.lang = isBritish ? 'en-GB' : 'en-US';
      }
      u.pitch = isBritish ? (pitch * 1.06) : (pitch * 0.94);
      u.rate = rate;

      const timer = setTimeout(resolve, 14000);
      u.onend = () => { clearTimeout(timer); resolve(); };
      u.onerror = () => { clearTimeout(timer); resolve(); };

      speechSynthesis.speak(u);
    });
  }

  function cancel() {
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  return {
    loadVoices,
    playCueTone,
    speak,
    cancel,
    getAudioContext
  };
})();
