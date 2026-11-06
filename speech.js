/**
 * Robust Speech Recognition Engine
 * ---------------------------------
 * Goals:
 *  - Stay listening for the full speaking window
 *  - Prevent word / phrase duplication (common Chrome bug)
 *  - Work well with Indian English (en-IN)
 *  - Clean, silent UI messages
 */

const SpeechEngine = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isActive = false;
  let sessionToken = 0;
  let stableText = '';
  let onUpdate = null;   // callback(text)
  let onStatus = null;   // callback(statusMessage)

  // ---------- helpers ----------
  function dedupe(text) {
    if (!text) return '';
    let cleaned = text.replace(/\s+/g, ' ').trim();
    let prev = '';
    // Keep removing consecutive repeats until stable
    while (prev !== cleaned) {
      prev = cleaned;
      cleaned = cleaned
        .replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1')
        .replace(/\b(\w+\s+\w+)(?:\s+\1\b)+/gi, '$1')
        .replace(/\b(\w+\s+\w+\s+\w+)(?:\s+\1\b)+/gi, '$1')
        .replace(/\b(\w+\s+\w+\s+\w+\s+\w+)(?:\s+\1\b)+/gi, '$1');
    }
    return cleaned.trim();
  }

  function setStatus(msg) {
    if (typeof onStatus === 'function') onStatus(msg);
  }

  function emit(text) {
    const clean = dedupe(text);
    if (typeof onUpdate === 'function') onUpdate(clean);
  }

  // ---------- public API ----------
  function isSupported() {
    return !!SR;
  }

  /**
   * Start listening for one speaking turn.
   * @param {object} options
   * @param {function} options.onUpdate  - called with current transcript
   * @param {function} options.onStatus  - called with status string
   * @param {number}   options.token     - session token for cancellation
   */
  function start(options = {}) {
    stop(); // clean previous

    if (!SR) {
      setStatus('Speech recognition not supported in this browser. Please type.');
      return;
    }

    onUpdate = options.onUpdate || null;
    onStatus = options.onStatus || null;
    sessionToken = options.token || 0;
    stableText = '';
    isActive = true;

    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      if (!isActive) return;
      setStatus('Listening... Speak now');
    };

    recognition.onsoundstart = () => {
      if (!isActive) return;
      setStatus('Sound detected...');
    };

    recognition.onspeechstart = () => {
      if (!isActive) return;
      setStatus('Voice detected...');
    };

    recognition.onresult = (event) => {
      if (!isActive) return;

      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = (res[0] && res[0].transcript) ? res[0].transcript.trim() : '';

        if (res.isFinal) {
          if (transcript) {
            // Append + immediate dedupe (this is the main anti-duplication)
            stableText = dedupe((stableText + ' ' + transcript).trim());
          }
        } else {
          interim = transcript;
        }
      }

      let display = stableText;
      if (interim) {
        display = dedupe((stableText + ' ' + interim).trim());
      }
      emit(display);
    };

    recognition.onerror = (event) => {
      if (!isActive) return;
      const err = event.error;
      if (err === 'no-speech') {
        setStatus('Listening... continue speaking');
      } else if (err === 'audio-capture') {
        setStatus('Microphone busy or not found. Check system settings.');
      } else if (err === 'network') {
        setStatus('Network issue. Keep speaking...');
      } else if (err !== 'aborted') {
        setStatus('Audio notice: ' + err);
      }
    };

    recognition.onend = () => {
      // Auto-restart quickly while the turn is still active
      if (isActive && recognition) {
        setTimeout(() => {
          if (isActive && recognition) {
            try {
              recognition.start();
            } catch (e) {
              // one more quiet retry
              setTimeout(() => {
                if (isActive && recognition) {
                  try { recognition.start(); } catch (e2) {}
                }
              }, 120);
            }
          }
        }, 70);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setStatus('Could not start microphone: ' + e.message);
    }
  }

  function stop() {
    isActive = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (e) {}
      recognition = null;
    }
    stableText = '';
  }

  function getCurrentText() {
    return stableText;
  }

  return {
    isSupported,
    start,
    stop,
    getCurrentText
  };
})();
