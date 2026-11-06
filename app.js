/**
 * Main application logic – Mock Paper 3
 */

(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  let activeItems = [];
  let n = 0;
  let ans = [];
  let mt = [];
  let meta = {};
  let seen = {};
  let tm = null;
  let currentSessionToken = 0;
  let micGranted = false;
  let meterInterval = null;
  let testAudioStream = null;

  // ---------- helpers ----------
  function buildTestSequence() {
    activeItems = [];
    for (const p of ['A', 'B', 'C', 'D', 'E', 'F']) {
      MOCK_PAPER_3[p].forEach((item, idx) => {
        activeItems.push({ part: p, data: item, origIdx: idx });
      });
    }
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function playTaskAudio(part, data, i, token) {
    await wait(300);
    if (token !== currentSessionToken) return;
    const isBritish = (i % 2 === 1);

    if (part === 'A' || part === 'E') {
      await AudioEngine.speak(data, isBritish, 1, part === 'E' ? 0.92 : 0.95, token, currentSessionToken);
    } else if (part === 'B') {
      for (const chunk of data[0]) {
        if (token !== currentSessionToken) return;
        await AudioEngine.speak(chunk, isBritish, 1, 0.95, token, currentSessionToken);
        await wait(500);
        if (token !== currentSessionToken) return;
      }
    } else if (part === 'C') {
      const [lines, q] = data;
      for (let k = 0; k < lines.length; k++) {
        if (token !== currentSessionToken) return;
        const speakerIsUK = (k % 2 === 1);
        const pitch = speakerIsUK ? 1.15 : 0.92;
        await AudioEngine.speak(lines[k], speakerIsUK, pitch, 0.95, token, currentSessionToken);
        await wait(350);
        if (token !== currentSessionToken) return;
      }
      if (token !== currentSessionToken) return;
      await AudioEngine.speak('Question. ' + q, false, 1, 0.95, token, currentSessionToken);
    }
  }

  function ring(sec) {
    return `<div class="center"><span class="timerbox" id="tmn">${String(sec).padStart(2, '0')}</span><div class="mut" style="margin-top:4px">seconds remaining</div></div>`;
  }

  function bar() {
    const pct = Math.round((100 * n) / activeItems.length);
    return `<div class="statusbar"><span>Item ${Math.min(n + 1, activeItems.length)} of ${activeItems.length}</span><span>${pct}% complete</span></div><div class="bar"><i style="width:${pct}%"></i></div>`;
  }

  function cd(tot, f, token) {
    let t = tot;
    tm = setInterval(() => {
      if (token !== currentSessionToken) { clearInterval(tm); return; }
      t--;
      const el = $('tmn');
      if (el) el.textContent = String(Math.max(t, 0)).padStart(2, '0');
      if (t <= 0) { clearInterval(tm); f(); }
    }, 1000);
  }

  // ---------- mic test ----------
  async function chkM() {
    try {
      if (meterInterval) clearInterval(meterInterval);
      if (testAudioStream) testAudioStream.getTracks().forEach(t => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      testAudioStream = stream;
      micGranted = true;

      $('chk').textContent = 'Microphone verified! Speak to test volume level below:';
      $('chk').style.color = 'var(--ok)';
      $('vuBox').style.display = 'block';

      const actx = AudioEngine.getAudioContext();
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      meterInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const pct = Math.min(100, Math.round((sum / dataArray.length / 64) * 100));
        if ($('vuFill')) $('vuFill').style.width = pct + '%';
      }, 80);

      setTimeout(() => {
        if (meterInterval) clearInterval(meterInterval);
        if (testAudioStream) {
          testAudioStream.getTracks().forEach(t => t.stop());
          testAudioStream = null;
        }
        if ($('chk')) $('chk').textContent = 'Microphone verified and locked. Ready for assessment.';
        if ($('vuBox')) $('vuBox').style.display = 'none';
      }, 6000);
    } catch (e) {
      $('chk').textContent = 'Microphone blocked or not found. Please click the padlock in the address bar and enable Microphone.';
      $('chk').style.color = 'var(--red)';
      $('vuBox').style.display = 'none';
    }
  }

  function chkA() {
    AudioEngine.cancel();
    AudioEngine.playCueTone(currentSessionToken, currentSessionToken).then(() => {
      AudioEngine.speak('Audio check complete. Your headset or speakers are functioning properly.', false, 1, 0.95, currentSessionToken, currentSessionToken)
        .then(() => {
          $('chk').textContent = 'Audio test played.';
          $('chk').style.color = 'var(--p-blue)';
        });
    });
  }

  // ---------- screens ----------
  function goHome() {
    currentSessionToken++;
    clearInterval(tm);
    if (meterInterval) clearInterval(meterInterval);
    if (testAudioStream) {
      testAudioStream.getTracks().forEach(t => t.stop());
      testAudioStream = null;
    }
    AudioEngine.cancel();
    SpeechEngine.stop();
    intro();
  }

  function intro() {
    currentSessionToken++;
    AudioEngine.cancel();
    SpeechEngine.stop();

    $('app').innerHTML = `
      <div class="panel">
        <div class="part-hd">
          <b>4 SKILLS ESSENTIAL TEST · MOCK PAPER 3</b>
          <span>Official 70-Item Practice Exam</span>
        </div>
        <div class="instr">
          <strong>Assessment Instructions:</strong> This mock exam consists of 70 items across 6 sections. Audio prompts play once. Speak immediately after the tone. Click the header at any time to cancel and return to this screen.
        </div>
        <div class="env-box">
          <b>Microphone & Environment Advisory:</b>
          <ul>
            <li>Sit in a completely quiet room to ensure the microphone picks up your voice properly.</li>
            <li>Position your headset microphone approximately two fingers (2–3 cm) away from the corner of your mouth.</li>
            <li>For all speaking tasks, audio plays first. Do not speak until the tone sounds.</li>
          </ul>
        </div>
        <table style="margin-bottom:16px">
          <tr><th>Part</th><th>Task</th><th>Items</th><th>Official Timer</th></tr>
          <tr><td>Part A</td><td>Repeat Sentences</td><td>16</td><td>15s speaking</td></tr>
          <tr><td>Part B</td><td>Sentence Builds</td><td>8</td><td>15s speaking</td></tr>
          <tr><td>Part C</td><td>Conversations</td><td>12</td><td>10s response</td></tr>
          <tr><td>Part D</td><td>Sentence Completion</td><td>18</td><td>25s timer</td></tr>
          <tr><td>Part E</td><td>Dictation</td><td>14</td><td>25s timer</td></tr>
          <tr><td>Part F</td><td>Passage Reconstruction</td><td>2</td><td>30s read / 90s rewrite</td></tr>
        </table>
        <p class="mut" style="font-weight:700;color:var(--ink)">Acoustic Hardware Verification</p>
        <div class="btnrow" style="justify-content:flex-start;border:none;padding-top:0">
          <button onclick="window.__chkA()">Test Audio</button>
          <button onclick="window.__chkM()">Test Microphone</button>
        </div>
        <div id="vuBox" class="vu-meter-box"><div id="vuFill" class="vu-meter-fill"></div></div>
        <p id="chk" class="mut" style="min-height:16px"></p>
        <div style="margin-top:20px">
          <button class="pri" style="width:100%;padding:14px;font-size:1.05rem" onclick="window.__launchMock()">Start Mock Paper 3 (70 Items)</button>
        </div>
      </div>
    `;
    AudioEngine.loadVoices();
  }

  async function launchMock() {
    if (!micGranted && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }
    buildTestSequence();
    n = 0; ans = []; mt = []; seen = {};
    showItem();
  }

  function showItem() {
    currentSessionToken++;
    const activeToken = currentSessionToken;
    clearInterval(tm);
    AudioEngine.cancel();
    SpeechEngine.stop();

    if (n >= activeItems.length) return finish();

    const curr = activeItems[n];
    const p = curr.part;
    const data = curr.data;
    const t = T_CONFIG[p];

    if (!seen[p]) {
      seen[p] = 1;
      $('app').innerHTML = bar() + `
        <div class="panel">
          <div class="part-hd"><b>Part ${p}: ${t[0]}</b><span>${t[1]}</span></div>
          <div class="instr">${t[2]}</div>
          <div class="btnrow"><button class="pri" onclick="window.__showItem()">Continue</button></div>
        </div>`;
      return;
    }

    let h = bar() + `<div class="panel"><div class="part-hd"><b>Part ${p}: ${t[0]}</b><span>${t[1]}</span></div>`;

    if (p === 'D') {
      h += `
        <p class="qtext">${esc(data[0])}</p>
        ${ring(25)}
        <input id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type one word">
        <div class="btnrow"><button class="pri" onclick="window.__nx()">Next</button></div>`;
    } else if (p === 'F') {
      h += `
        <div id="fb">
          <div class="no-copy" oncopy="return false" oncut="return false" oncontextmenu="return false">
            <p class="qtext" style="line-height:1.6;background:#FAFBFD;padding:16px;border:1px solid var(--line);border-radius:4px">${esc(data[0])}</p>
          </div>
          <p class="mut">This passage will disappear after 30 seconds. Do not write or take notes.</p>
          ${ring(30)}
          <div class="btnrow"><button class="pri" onclick="window.__fw()">I Have Finished Reading</button></div>
        </div>`;
    } else {
      h += `
        <div class="rec" id="recind"><span class="dot"></span><span id="st">Playing audio prompt…</span></div>
        ${ring(t[3] || 1)}`;
      if (p === 'E') {
        h += `<textarea id="ans" autocomplete="off" spellcheck="false" placeholder="Type the sentence exactly as you heard it"></textarea>`;
      } else {
        h += `
          <div style="margin:12px 0 6px">
            <label class="mut" style="font-size:.78rem;font-weight:700;text-transform:uppercase">Spoken Response (Voice Captured):</label>
            <input id="ans" autocomplete="off" placeholder="Your spoken words will appear here automatically..." style="background:#F7F9FA;color:#002E3B;font-weight:600">
          </div>
          <p id="note" class="mut" style="min-height:16px">Microphone will activate after the tone.</p>`;
      }
      h += `<div class="btnrow"><button class="pri" onclick="window.__nx()">Next</button></div>`;
    }

    $('app').innerHTML = h + '</div>';

    if (p === 'D') {
      cd(25, nx, activeToken);
      $('ans').focus();
    } else if (p === 'F') {
      cd(30, fw, activeToken);
    } else {
      (async () => {
        await playTaskAudio(p, data, n, activeToken);
        if (activeToken !== currentSessionToken) return;

        if (p === 'A' || p === 'B' || p === 'C') {
          await AudioEngine.playCueTone(activeToken, currentSessionToken);
        }
        if (activeToken !== currentSessionToken) return;
        await wait(400);
        if (activeToken !== currentSessionToken) return;

        $('st').textContent = (p === 'E') ? 'Type now' : 'Respond now (Microphone Active)';
        meta.t0 = Date.now();
        cd(t[3], nx, activeToken);

        if (p === 'E') {
          $('ans').focus();
        } else {
          // Start robust speech recognition
          if ($('recind')) $('recind').classList.add('live');
          SpeechEngine.start({
            token: activeToken,
            onUpdate: (text) => {
              const currItem = activeItems[n];
              let targetText = '';
              if (currItem) {
                targetText = (currItem.part === 'A') ? currItem.data :
                             (currItem.part === 'B' ? currItem.data[1][0] :
                             (currItem.part === 'C' ? currItem.data[2].join(' ') : ''));
              }
              const repaired = Scoring.phoneticRepair(text, targetText);
              meta.txt = repaired;
              if ($('ans')) $('ans').value = repaired;
            },
            onStatus: (msg) => {
              if ($('note')) $('note').textContent = msg;
            }
          });
        }
      })();
    }
  }

  function fw() {
    currentSessionToken++;
    clearInterval(tm);
    SpeechEngine.stop();
    $('fb').innerHTML = `
      <p class="mut">Rewrite the passage in your own words below.</p>
      ${ring(90)}
      <textarea id="ans" spellcheck="false" placeholder="Type your answer here"></textarea>
      <div class="btnrow"><button class="pri" onclick="window.__nx()">Next</button></div>`;
    cd(90, nx, currentSessionToken);
    $('ans').focus();
  }

  function nx() {
    currentSessionToken++;
    clearInterval(tm);
    AudioEngine.cancel();
    SpeechEngine.stop();

    ans.push($('ans') ? $('ans').value : '');
    mt.push(meta);
    meta = {};
    n++;

    if (n >= activeItems.length) finish();
    else showItem();
  }

  function finish() {
    currentSessionToken++;
    clearInterval(tm);
    AudioEngine.cancel();
    SpeechEngine.stop();

    try {
      const it = { A: [], B: [], C: [], D: [], E: [], F: [] };
      let rv = '';

      activeItems.forEach((curr, k) => {
        const v = ans[k] || '';
        const o = Scoring.scoreItem(curr, v, mt[k]);
        it[curr.part].push(o);

        let targetDisplay = '';
        if (curr.part === 'A' || curr.part === 'E') targetDisplay = typeof curr.data === 'string' ? curr.data : '';
        else if (curr.part === 'B') targetDisplay = (curr.data?.[1]?.[0]) || '';
        else if (curr.part === 'C') targetDisplay = (curr.data?.[1] || '') + ' → ' + ((curr.data?.[2] || []).join('/'));
        else if (curr.part === 'D') targetDisplay = (curr.data?.[0] || '') + ' → ' + ((curr.data?.[1] || []).join('/'));
        else if (curr.part === 'F') targetDisplay = curr.data?.[0] || '';

        const scorePct = Object.values(o).map(z => Math.round((z || 0) * 100) + '%').join(' / ');
        rv += `<tr><td>${curr.part}${k + 1}</td><td>${esc(v || '(blank)')}</td><td>${esc(targetDisplay)}</td><td>${scorePct}</td></tr>`;
      });

      const av = (ps, key) => {
        const z = ps.flatMap(p => (it[p] || []).map(o => o[key])).filter(z => z != null);
        return z.length ? z.reduce((a, b) => a + b, 0) / z.length : null;
      };

      const K_SKILLS = {
        Speaking: [
          ['Sentence mastery', 'A, B', 'AB', 'sm', 0.65],
          ['Vocabulary selection', 'A, B', 'AB', 'vo', 0.35]
        ],
        Listening: [
          ['Conversation comprehension', 'C', 'C', 'c', 0.50],
          ['Spoken sentence retention', 'E', 'E', 'lis', 0.50]
        ],
        Reading: [
          ['Vocabulary in context', 'D', 'D', 'd', 0.60],
          ['Passage comprehension', 'F', 'F', 'cov', 0.40]
        ],
        Writing: [
          ['Dictation accuracy & spelling', 'E', 'E', 'sp', 0.30],
          ['Punctuation & capitalization', 'E', 'E', 'pu', 0.15],
          ['Reconstruction content & sequence', 'F', 'F', 'con', 0.30],
          ['Grammar & mechanics', 'F', 'F', 'mech', 0.15],
          ['Vocabulary variety', 'F', 'F', 'va', 0.10]
        ]
      };

      let cards = '', subscores = {}, totalScore = 0;
      for (const s in K_SKILLS) {
        const rows = K_SKILLS[s].map(r => ({ l: r[0], w: r[4], v: av(r[2].split(''), r[3]) }));
        const ok = rows.filter(r => r.v != null);
        const rawPct = ok.length ? ok.reduce((a, r) => a + (r.v || 0) * r.w, 0) / (ok.reduce((a, r) => a + r.w, 0) || 1) : 0;
        const sco = Scoring.calculateVersantScore(rawPct);
        subscores[s] = sco;
        totalScore += sco;

        cards += `
          <div class="panel">
            <div class="part-hd"><b>${s}</b><span class="badge">${sco} / 80 · GSE: ${Scoring.toGSE(sco)}/90 · ${Scoring.band(sco)}</span></div>
            <table><tr><th>Sub-skill</th><th>Score</th></tr>
              ${rows.map(r => {
                const sc = r.v == null ? 20 : Scoring.calculateVersantScore(r.v);
                return `<tr><td>${r.l}</td><td><strong>${sc}</strong> / 80 (${Math.round((r.v || 0) * 100)}%)</td></tr>`;
              }).join('')}
            </table>
          </div>`;
      }

      const O = isNaN(totalScore) ? 20 : Math.round(totalScore / 4);
      let lsrw = '';
      for (const s2 in K_SKILLS) {
        const sco = subscores[s2] || 20;
        lsrw += `
          <div class="skill-card">
            <div class="sk-name">${s2}</div>
            <div class="sk-num">${sco}<span style="font-size:.9rem;color:var(--mut)"> / 80</span></div>
            <div class="sk-bar"><i style="width:${Math.round(100 * (sco - 20) / 60)}%"></i></div>
            <div class="mut" style="margin-top:4px">GSE: ${Scoring.toGSE(sco)} · ${Scoring.band(sco)}</div>
          </div>`;
      }

      $('app').innerHTML = `
        <div class="score-hd">
          <div class="lbl">Assessment Overall Score</div>
          <div class="num">${O}</div>
          <div class="lbl">out of 80 · ${Scoring.band(O)}</div>
          <div class="score-sub">Global Scale of English (GSE): ${Scoring.toGSE(O)} / 90</div>
        </div>
        <div class="lsrw">${lsrw}</div>
        <div class="panel"><details open><summary>Core Skill Diagnostics</summary><div style="margin-top:12px">${cards}</div></details></div>
        <div class="panel"><details><summary>Review Item Audit (${activeItems.length} total)</summary>
          <div style="overflow-x:auto;margin-top:10px">
            <table><tr><th>Item</th><th>Your Answer</th><th>Target</th><th>Item Accuracy</th></tr>${rv}</table>
          </div>
        </details></div>
        <div class="btnrow" style="margin:16px">
          <button onclick="window.print()">Print Score Report (PDF)</button>
          <button class="pri" onclick="window.__goHome()">Return to Home</button>
        </div>`;
    } catch (err) {
      console.error(err);
      $('app').innerHTML = `<div class="panel"><p>Test completed. Scorecard could not render.</p>
        <div class="btnrow"><button class="pri" onclick="window.__goHome()">Return to Home</button></div></div>`;
    }
  }

  // Expose functions needed by inline onclick handlers
  window.__goHome = goHome;
  window.__chkA = chkA;
  window.__chkM = chkM;
  window.__launchMock = launchMock;
  window.__showItem = showItem;
  window.__nx = nx;
  window.__fw = fw;

  // Boot
  try {
    intro();
  } catch (e) {
    if ($('app')) {
      $('app').innerHTML = `<div class="panel" style="color:var(--red)"><b>Critical Error:</b> ${e.message}</div>`;
    }
  }
})();
