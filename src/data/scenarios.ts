import { Scenario, BankConfig, LabTestItem } from '../types.ts';

export const SCENARIOS: Record<string, Scenario> = {
  kyc: {
    key: 'kyc',
    label: 'Fake KYC',
    from: '+91 98XXX-11029',
    init: 'KY',
    text: 'URGENT: Your bank KYC will expire today. Verify immediately or your account will be blocked: bit.ly/kyc-upd8',
    amount: 48000,
    payee: 'kyc-verify@upi',
    ctx: { device: 82, txn: 91, ben: 78, graph: 89 },
    ev: [['Suspicious link opened', 66, 'a']],
  },
  police: {
    key: 'police',
    label: 'Fake police',
    from: '+91 90XXX-44821',
    init: 'CC',
    text: 'Cyber Crime Cell: A parcel with illegal items is registered in your name. Pay the verification fee within 1 hour to avoid arrest.',
    amount: 120000,
    payee: 'cybercell-fee@upi',
    ctx: { device: 80, txn: 93, ben: 82, graph: 88 },
    ev: [['Unknown caller claiming to be police', 138, 'a']],
  },
  lottery: {
    key: 'lottery',
    label: 'Lottery',
    from: '+91 88XXX-77012',
    init: 'LD',
    text: 'Congratulations! You have won Rs 25,00,000 in the KBC lucky draw. Pay a Rs 4,999 processing fee to claim your prize.',
    amount: 4999,
    payee: 'kbc-claim@upi',
    ctx: { device: 70, txn: 55, ben: 74, graph: 60 },
    ev: [['Reply sent to unknown sender', 72, 'a']],
  },
  support: {
    key: 'support',
    label: 'Fake support',
    from: '+91 92XXX-30044',
    init: 'PS',
    text: 'PhonePe Support: Your account is compromised. Install AnyDesk and share the code so we can process your refund.',
    amount: 60000,
    payee: 'refund-desk@upi',
    ctx: { device: 88, txn: 89, ben: 79, graph: 86 },
    ev: [
      ['Unknown caller claiming to be support', 95, 'a'],
      ['Remote-access app installed', 150, 'r'],
    ],
  },
  collect: {
    key: 'collect',
    label: 'Collect request',
    from: 'CASHBK-OFR',
    init: 'CB',
    text: 'Rs 9,999 cashback approved! Accept the UPI collect request and enter your PIN to receive the amount.',
    amount: 9999,
    payee: 'cashback-offers@upi',
    ctx: { device: 72, txn: 88, ben: 80, graph: 84 },
    ev: [['UPI collect request received', 40, 'a']],
  },
  safe: {
    key: 'safe',
    label: 'Normal bill',
    from: 'BESCOM',
    init: 'BE',
    text: 'Your electricity bill of Rs 1,240 is due on 12 Oct. Pay through your bank app.',
    safe: true,
    ctx: { device: 8, txn: 0, ben: 0, graph: 6 },
  },
};

export const BASE_MESSAGES = [
  { f: 'Mom', i: 'M', t: 'Reached home safely, call me when free' },
  { f: 'Amit', i: 'A', t: 'Lunch at 1 tomorrow?' },
];

export const PHASES = [
  'Detect',
  'Analyze',
  'Correlate',
  'Signal',
  'Respond',
  'Contain',
];

export const CHECKS = [
  'Language analysis',
  'Sender analysis',
  'URL analysis',
  'Financial intent',
  'Social-engineering patterns',
];

export const BANKS: BankConfig[] = [
  {
    id: 'A',
    n: 'Bank A',
    role: "Payer's bank",
    off: 0,
    th: { HOLD: 90, VERIFY: 70, MONITOR: 40 },
  },
  {
    id: 'B',
    n: 'Bank B',
    role: "Payee's bank",
    off: -22,
    th: { HOLD: 95, VERIFY: 65, MONITOR: 40 },
  },
  {
    id: 'C',
    n: 'Bank C',
    role: 'Linked account',
    off: -45,
    th: { HOLD: 95, VERIFY: 80, MONITOR: 35 },
  },
];

export const ACT_LABELS: Record<string, [string, string]> = {
  HOLD: ['Hold', 'Transaction held for review'],
  VERIFY: ['Verify', 'Step-up verification required'],
  MONITOR: ['Monitor', 'Enhanced monitoring on'],
  NONE: ['No action', "Below this bank's thresholds"],
};

export const LAB_TESTS: LabTestItem[] = [
  { id: 1, title: 'KYC scam', input: SCENARIOS.kyc.text, expected: true },
  { id: 2, title: 'Lottery scam', input: SCENARIOS.lottery.text, expected: true },
  { id: 3, title: 'Fake support', input: SCENARIOS.support.text, expected: true },
  {
    id: 4,
    title: 'Misspelled scam',
    input: 'Dear custmer, your acount will be bloked today. Verify KYC immediatly.',
    expected: true,
  },
  {
    id: 5,
    title: 'Obfuscated scam',
    input: 'URG3NT!! Y0ur K.Y.C exp1res t0day. Upd@te n0w: tinyurl.com/x9k',
    expected: true,
  },
  {
    id: 6,
    title: 'Mixed English + Telugu',
    input:
      'Mee bank KYC ventane update cheyandi, lekapothe account block avutundi. Link: bit.ly/kyc-te',
    expected: true,
  },
  {
    id: 7,
    title: 'Telugu script',
    input: 'మీ KYC ఈరోజు గడువు ముగుస్తుంది, వెంటనే అప్‌డేట్ చేయండి: bit.ly/x',
    expected: true,
  },
  {
    id: 8,
    title: 'Indirect wording',
    input:
      "Hi, this is from your bank's verification team. To keep services running, please complete the pending check here: bit.ly/verify-acc",
    expected: true,
  },
  {
    id: 9,
    title: 'Multi-message attack',
    input:
      'Hello sir, calling from SBI. + Please share the OTP you just received to stop the block.',
    expected: true,
  },
  {
    id: 10,
    title: 'Benign bank alert',
    input:
      'Your a/c XX1234 is debited Rs 500 on 20 Sep. Never share your OTP with anyone. -SBI',
    expected: false,
  },
  {
    id: 11,
    title: 'Benign OTP',
    input: 'Your OTP for login is 482913. Do not share it with anyone.',
    expected: false,
  },
  {
    id: 12,
    title: 'Short link alone',
    input: 'Hey, the photos from the trip are here: bit.ly/3xYz',
    expected: false,
  },
  { id: 13, title: 'Normal bill', input: SCENARIOS.safe.text, expected: false },
  { id: 14, title: 'Screenshot scam', input: '(image scan)', expected: null, notSupported: true },
];

export const GRAPH_NODES: Record<string, [number, number, string]> = {
  user: [45, 140, 'Phone'],
  acct: [125, 140, 'Acct A'],
  dev: [195, 70, 'Dev-88'],
  upi: [195, 208, 'UPI App'],
  int: [290, 140, 'Payment Int'],
  ax: [375, 140, 'Acct X'],
  ba: [460, 70, 'Bank A'],
  bb: [460, 208, 'Bank B'],
  mule: [545, 208, 'Mule X'],
  ay: [615, 140, 'Acct Y'],
  az: [615, 250, 'Acct Z'],
};

export const GRAPH_EDGES: [string, string][] = [
  ['user', 'acct'],
  ['acct', 'dev'],
  ['acct', 'upi'],
  ['dev', 'int'],
  ['upi', 'int'],
  ['int', 'ax'],
  ['ax', 'ba'],
  ['ax', 'bb'],
  ['bb', 'mule'],
  ['mule', 'ay'],
  ['mule', 'az'],
];

export const GRAPH_PATH = [
  'user-acct',
  'acct-upi',
  'upi-int',
  'int-ax',
  'ax-bb',
  'bb-mule',
  'mule-ay',
  'mule-az',
];
