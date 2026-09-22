import { ThreatCategory, ClassificationResult, ScenarioContext } from '../types.ts';

export const CATS: ThreatCategory[] = [
  {
    k: 'urgency',
    l: 'Pressure to act now',
    w: [
      'urgent',
      'immediately',
      'today',
      'expire',
      'expires',
      'within 1 hour',
      'within an hour',
      'pending',
      'update now',
      'right now',
      'ventane',
      'వెంటనే',
      'ఈరోజు',
      'గడువు',
    ],
  },
  {
    k: 'threat',
    l: 'Threat or penalty',
    w: [
      'blocked',
      'block avutundi',
      'arrest',
      'illegal',
      'legal action',
      'suspended',
      'compromised',
      'stop the block',
      'penalty',
    ],
  },
  {
    k: 'imp',
    l: 'Pretends to be a bank or authority',
    w: [
      'rbi',
      'bank kyc',
      'cyber crime',
      'cyber cell',
      'police',
      'support',
      'customer care',
      'verification team',
      'calling from',
      'sbi',
      'income tax',
    ],
  },
  {
    k: 'cred',
    l: 'Asks for KYC, OTP, PIN or a code',
    w: [
      'kyc',
      'otp',
      'pin',
      'password',
      'cvv',
      'aadhaar',
      'share the code',
      'share the otp',
    ],
    neg: true,
  },
  {
    k: 'link',
    l: 'Suspicious or shortened link',
    re: /(bit\.ly|tinyurl|https?:\/\/|www\.|\.xyz|\.top|link:)/,
  },
  {
    k: 'pay',
    l: 'Demands a fee or collect approval',
    w: ['fee', 'collect request', 'processing fee', 'pay the', 'enter your pin'],
  },
  {
    k: 'reward',
    l: 'Too-good-to-be-true reward',
    w: [
      'congratulations',
      'you have won',
      'lucky draw',
      'prize',
      'cashback',
      'lottery',
    ],
  },
  {
    k: 'remote',
    l: 'Asks to install a remote-access app',
    w: [
      'anydesk',
      'teamviewer',
      'quicksupport',
      'screen share',
      'share screen',
    ],
  },
];

export function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 9;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[a.length][b.length];
}

export function norm(t: string): string {
  let s = t.toLowerCase().replace(/[\u200b-\u200d]/g, '');
  s = s.replace(/[a-z0-9@$]+/g, (w) =>
    /[a-z]/.test(w) && /[0-9@$]/.test(w)
      ? w
          .replace(/0/g, 'o')
          .replace(/1/g, 'i')
          .replace(/3/g, 'e')
          .replace(/4/g, 'a')
          .replace(/5/g, 's')
          .replace(/@/g, 'a')
          .replace(/\$/g, 's')
      : w
  );
  s = s.replace(/\b(?:[a-z]\.)+[a-z]\b/g, (m) => m.replace(/\./g, ''));
  return s;
}

export function hasKw(s: string, words: string[], kw: string): boolean {
  if (/[^\x00-\x7f]/.test(kw)) return s.includes(kw);
  const re = new RegExp(
    '(^|[^a-z0-9])' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)'
  );
  if (re.test(s)) return true;
  if (!kw.includes(' ') && kw.length >= 7) {
    return words.some((w) => w.length >= kw.length - 1 && lev(w, kw) <= 1);
  }
  return false;
}

export function classify(text: string): ClassificationResult {
  const s = norm(text);
  const words = s.split(/[^a-z0-9]+/).filter(Boolean);
  const negated = /(do not|don't|dont|never) share/.test(s);
  const hits: ThreatCategory[] = [];

  CATS.forEach((c) => {
    if (c.neg && negated) return;
    const hit = c.re ? c.re.test(s) : c.w ? c.w.some((kw) => hasKw(s, words, kw)) : false;
    if (hit) hits.push(c);
  });

  const m = hits.length;
  const risk = m === 0 ? 6 : Math.min(95, 40 + m * 10);
  const conf = m === 0 ? 96 : Math.min(97, 82 + m * 3);

  return {
    hits,
    risk,
    conf,
    scam: risk >= 60,
    cls: risk >= 60 ? 'SOCIAL_ENGINEERING' : 'BENIGN',
  };
}

/**
 * Multi-factor Noisy-OR risk fusion
 */
export function fuse(ctx: ScenarioContext & { message: number }): number {
  const r = [ctx.device, ctx.message, ctx.txn, ctx.ben, ctx.graph];
  let q = 1;
  r.forEach((v) => {
    q *= 1 - (0.5 * v) / 100;
  });
  return Math.round(100 * (1 - q));
}
