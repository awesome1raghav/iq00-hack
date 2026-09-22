export type ThreatCategoryKey =
  | 'urgency'
  | 'threat'
  | 'imp'
  | 'cred'
  | 'link'
  | 'pay'
  | 'reward'
  | 'remote';

export interface ThreatCategory {
  k: ThreatCategoryKey;
  l: string;
  w?: string[];
  re?: RegExp;
  neg?: boolean;
}

export interface ClassificationResult {
  hits: ThreatCategory[];
  risk: number;
  conf: number;
  scam: boolean;
  cls: 'SOCIAL_ENGINEERING' | 'BENIGN';
}

export interface ScenarioContext {
  device: number;
  txn: number;
  ben: number;
  graph: number;
}

export interface Scenario {
  key: string;
  label: string;
  from: string;
  init: string;
  text: string;
  amount?: number;
  payee?: string;
  safe?: boolean;
  ctx: ScenarioContext;
  ev?: [string, number, 'a' | 'r' | 'g'][];
}

export interface BankConfig {
  id: 'A' | 'B' | 'C';
  n: string;
  role: string;
  off: number;
  th: {
    HOLD: number;
    VERIFY: number;
    MONITOR: number;
  };
}

export type BankDecisionAction = 'HOLD' | 'VERIFY' | 'MONITOR' | 'NONE';

export interface BankDecision extends BankConfig {
  r: number;
  act: BankDecisionAction;
}

export interface AuditEvent {
  id: string;
  time: string;
  text: string;
  type?: 'r' | 'g' | 'a' | '';
}

export interface TimelineEvent {
  id: string;
  text: string;
  offsetSeconds: number;
  type?: 'r' | 'g' | 'a' | '';
}

export interface LabTestItem {
  id: number;
  title: string;
  input: string;
  expected: boolean | null; // null for OCR / unsupported
  result?: {
    scam: boolean;
    risk: number;
    conf: number;
  } | null;
  notSupported?: boolean;
}

export interface SyncMessage {
  type: 'SYNC_SCENARIO' | 'SYNC_STATUS' | 'SYNC_REVIEW' | 'SYNC_NETWORK_EVENT';
  payload: any;
  timestamp: number;
  clientId: string;
}

export interface NetworkThreatEvent {
  id: string;
  originBank: string;
  timestamp: string;
  signalHash: string;
  riskScore: number;
  action: string;
}
