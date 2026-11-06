/**
 * Scoring + light phonetic repair for Indian English
 */

const Scoring = (() => {
  const fix = s => String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim();

  const norm = s => {
    let str = fix(s).toLowerCase();
    str = str.replace(/\b(is\s+shoes)\b/g, 'issues');
    str = str.replace(/\b(is\s+shoe)\b/g, 'issue');
    return str.replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  };

  const tok = s => fix(s).match(/[A-Za-z0-9']+|[^\sA-Za-z0-9']/g) || [];

  function lcs(a, b) {
    const d = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
    return d[a.length][b.length];
  }

  const rat = (a, b) => lcs(a, b) / Math.max(a.length, b.length, 1);
  const cl = x => Math.max(0, Math.min(1, x));
  const bag = (t, r) => {
    const c = [...r];
    let k = 0;
    t.forEach(w => {
      const i = c.indexOf(w);
      if (i > -1) { c.splice(i, 1); k++; }
    });
    return k / (t.length || 1);
  };

  // Lightweight accent repair (invisible to user)
  function phoneticRepair(recognized, target) {
    if (!recognized || !target) return recognized;
    const userWords = recognized.split(/\s+/);
    const targetWords = target.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);

    const map = {
      'wery': 'very', 'wen': 'when', 'vat': 'what', 'vere': 'where', 'vy': 'why',
      'vill': 'will', 'vant': 'want', 'vas': 'was', 'ver': 'were',
      'tink': 'think', 'tank': 'thank', 'tanks': 'thanks',
      'dis': 'this', 'dat': 'that', 'dese': 'these', 'dose': 'those',
      'der': 'there', 'den': 'then', 'dem': 'them',
      'batch': 'badge', 'shoes': 'issues', 'shoe': 'issue',
      'cart': 'card', 'off': 'of', 'ov': 'of',
      'da': 'the', 'de': 'the', 'cud': 'could', 'wud': 'would', 'shud': 'should',
      'plese': 'please', 'tonite': 'tonight', 'abrod': 'abroad',
      'persue': 'pursue', 'dreems': 'dreams', 'layed': 'laid',
      'pandamic': 'pandemic', 'extand': 'extend', 'waranty': 'warranty',
      'proposel': 'proposal', 'anual': 'annual', 'manger': 'manager',
      'meting': 'meeting', 'importent': 'important', 'diferent': 'different',
      'becos': 'because', 'bcoz': 'because', 'abot': 'about',
      'pepal': 'people', 'numbar': 'number', 'employe': 'employee',
      'servis': 'service', 'atension': 'attention', 'aproove': 'approve'
    };

    const repaired = userWords.map(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9']/g, '');
      if (map[clean] && targetWords.includes(map[clean])) return map[clean];
      for (const tw of targetWords) {
        if (clean === tw) return tw;
        if (tw.endsWith('ed') && tw.slice(0, -2) === clean) return tw;
        if (tw.endsWith('s') && tw.slice(0, -1) === clean) return tw;
        if (clean.length >= 3 && tw.length >= 3 && Math.abs(clean.length - tw.length) <= 2) {
          if (lcs(clean, tw) >= Math.max(clean.length, tw.length) - 2) return tw;
        }
      }
      if (map[clean]) return map[clean];
      return w;
    });
    return repaired.join(' ');
  }

  function matchWord(refW, userW) {
    if (refW === userW) return true;
    if (refW.endsWith('ed') && refW.slice(0, -2) === userW) return true;
    if (refW.endsWith('d') && refW.slice(0, -1) === userW) return true;
    if (userW.endsWith('ed') && userW.slice(0, -2) === refW) return true;
    if (refW.endsWith('s') && refW.slice(0, -1) === userW) return true;
    if (userW.endsWith('s') && userW.slice(0, -1) === refW) return true;
    if ((refW === 'badge' && userW === 'batch') || (refW === 'batch' && userW === 'badge')) return true;
    if ((refW === 'card' && userW === 'cart') || (refW === 'cart' && userW === 'card')) return true;
    if ((refW === 'issues' && userW === 'shoes') || (refW === 'issues' && userW === 'issue')) return true;
    if (Math.abs(refW.length - userW.length) <= 1 && refW.length >= 3) {
      return (lcs(refW, userW) / Math.max(refW.length, userW.length)) >= 0.8;
    }
    return false;
  }

  function wordLcs(targetWords, userWords) {
    const m = targetWords.length, n = userWords.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (matchWord(targetWords[i - 1], userWords[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return dp[m][n];
  }

  function flexibleRat(targetWords, userWords) {
    return wordLcs(targetWords, userWords) / Math.max(targetWords.length, userWords.length, 1);
  }

  function flexibleBag(targetWords, userWords) {
    const c = [...userWords];
    let matches = 0;
    targetWords.forEach(tw => {
      const idx = c.findIndex(uw => matchWord(tw, uw));
      if (idx > -1) { c.splice(idx, 1); matches++; }
    });
    return matches / (targetWords.length || 1);
  }

  function mech(v) {
    const s = v.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!s.length) return 0;
    return s.filter(x => /^[A-Z]/.test(x) && /[.!?]$/.test(x)).length / s.length;
  }

  function scoreItem(curr, v, m) {
    const p = curr.part;
    const x = curr.data;
    m = m || {};
    const cleanAns = (v || '').trim();

    if (!cleanAns) {
      if (p === 'A' || p === 'B') return { sm: 0, vo: 0 };
      if (p === 'C') return { c: 0 };
      if (p === 'D') return { d: 0 };
      if (p === 'E') return { lis: 0, sp: 0, cap: 0, pu: 0 };
      if (p === 'F') return { cov: 0, con: 0, mech: 0, va: 0 };
    }

    const candidates = [cleanAns];
    if (m.alternatives && Array.isArray(m.alternatives)) {
      m.alternatives.forEach(alt => { if (!candidates.includes(alt)) candidates.push(alt); });
    }

    if (p === 'A' || p === 'B') {
      const targetNorms = (p === 'A') ? [norm(x)] : x[1].map(norm);
      let bestSm = 0, bestVo = 0;
      candidates.forEach(trans => {
        const userNorm = norm(trans);
        targetNorms.forEach(tNorm => {
          const sm = flexibleRat(tNorm, userNorm);
          const vo = flexibleBag(tNorm, userNorm);
          if (sm > bestSm) bestSm = sm;
          if (vo > bestVo) bestVo = vo;
        });
      });
      return { sm: bestSm, vo: bestVo };
    }

    if (p === 'C') {
      const isCorrect = candidates.some(trans => {
        const transLo = trans.toLowerCase();
        const transNorm = norm(trans);
        return x[2].some(k => transNorm.includes(k) || (k.length > 2 && transLo.includes(k)));
      });
      return { c: isCorrect ? 1.0 : 0.0 };
    }

    if (p === 'D') {
      const cleaned = fix(cleanAns).toLowerCase();
      const isCorrect = x[1].some(acc => acc.toLowerCase() === cleaned);
      return { d: isCorrect ? 1.0 : 0.0 };
    }

    if (p === 'E') {
      const a = tok(x), b = tok(cleanAns);
      const pa = a.filter(t => /^[^A-Za-z0-9']/.test(t));
      const pb = b.filter(t => /^[^A-Za-z0-9']/.test(t));
      return {
        lis: flexibleBag(norm(x), norm(cleanAns)),
        sp: rat(norm(x), norm(cleanAns)),
        cap: bag(a.filter(t => /^[A-Z]/.test(t)), b),
        pu: pa.length ? (lcs(pa, pb) / Math.max(pa.length, pb.length, 1)) : 1.0
      };
    }

    // Part F
    const lo = cleanAns.toLowerCase(), w = norm(cleanAns);
    const targetWords = norm(x[0]);
    const cov = x[1].filter(g => g.some(k => lo.includes(k))).length / x[1].length;
    const ln = cl(w.length / Math.max(targetWords.length * 0.55, 1));
    const ss = cleanAns.split(/(?<=[.!?])\s+/).filter(Boolean);
    const lk = ss.filter(z => /\b(because|but|and|so|although|while|which|who|when|after|before|then|however|therefore)\b/i.test(z)).length / (ss.length || 1);

    return {
      cov,
      con: cl(cov * 0.7 + ln * 0.3),
      mech: mech(cleanAns),
      va: 0.5 * cl(new Set(w).size / (w.length || 1) / 0.75) + 0.5 * cl(lk / 0.45)
    };
  }

  const calculateVersantScore = pct => {
    if (pct <= 0.02) return 20;
    if (pct >= 0.98) return 80;
    return Math.round(20 + 60 * pct);
  };

  const band = o => o < 32 ? 'A1' : o < 43 ? 'A2' : o < 56 ? 'B1' : o < 68 ? 'B2' : o < 78 ? 'C1' : 'C2';
  const toGSE = s => Math.round(10 + ((s - 20) / 60) * 80);

  return {
    phoneticRepair,
    scoreItem,
    calculateVersantScore,
    band,
    toGSE,
    norm,
    fix
  };
})();
