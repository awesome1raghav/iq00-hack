import React from 'react';
import { Shield, ShieldAlert, AlertTriangle, Check, Loader2, Wifi, Battery } from 'lucide-react';
import { ThreatCategory } from '../types.ts';
import { CHECKS, BASE_MESSAGES } from '../data/scenarios.ts';

interface PhoneSimulatorProps {
  shaking: boolean;
  guardState: 'idle' | 'scanning' | 'threat' | 'safe';
  incomingMessage: {
    from: string;
    init: string;
    text: string;
  } | null;
  scanTag: {
    text: string;
    scanning: boolean;
    scam: boolean;
    safe: boolean;
  } | null;
  analyzerVisible: boolean;
  analyzerChecks: number; // 0 to 5
  alertVisible: boolean;
  alertHits: ThreatCategory[];
  alertRisk: number;
  alertConf: number;
  onDismissAlert: () => void;
  paymentSheetVisible: boolean;
  paymentAmount?: number;
  paymentPayee?: string;
  paymentHeldText?: string;
  paymentStatusColor?: 'red' | 'amber' | 'green';
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  shaking,
  guardState,
  incomingMessage,
  scanTag,
  analyzerVisible,
  analyzerChecks,
  alertVisible,
  alertHits,
  alertConf,
  onDismissAlert,
  paymentSheetVisible,
  paymentAmount,
  paymentPayee,
  paymentHeldText,
  paymentStatusColor = 'amber',
}) => {
  return (
    <aside className="phone-col" aria-label="Simulated mobile device">
      <div className={`phone ${shaking ? 'shake' : ''}`}>
        <div className="screen">
          {/* Status Bar */}
          <div className="s-bar" aria-hidden="true">
            <span>10:42</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Header with On-Device Guard */}
          <div className="s-title">
            <span className="font-semibold text-slate-200">Messages</span>
            <div
              className={`guard ${
                guardState === 'threat'
                  ? 'threat'
                  : guardState === 'scanning'
                  ? 'warn'
                  : ''
              }`}
            >
              {guardState === 'threat' ? (
                <ShieldAlert className="w-3 h-3 text-red-400" />
              ) : (
                <Shield className="w-3 h-3" />
              )}
              <span>
                {guardState === 'threat'
                  ? 'Threat detected'
                  : guardState === 'scanning'
                  ? 'Analyzing...'
                  : 'AI Shield'}
              </span>
            </div>
          </div>

          {/* Feed */}
          <div className="feed" tabIndex={0} role="feed" aria-label="Message feed">
            {/* Previous messages */}
            {BASE_MESSAGES.map((m, idx) => (
              <article key={idx} className="row" aria-label={`Message from ${m.f}`}>
                <div className="m-av" aria-hidden="true">{m.i}</div>
                <div className="m-body">
                  <div className="m-from">
                    <span>{m.f}</span>
                    <span className="text-slate-500 font-normal">Yesterday</span>
                  </div>
                  <div className="m-txt">{m.t}</div>
                </div>
              </article>
            ))}

            {/* Incoming Scenario Message */}
            {incomingMessage && (
              <article
                className={`row ${
                  scanTag?.scam
                    ? 'scam'
                    : scanTag?.safe
                    ? 'safe'
                    : scanTag?.scanning
                    ? 'scan'
                    : ''
                }`}
                aria-label={`Incoming message from ${incomingMessage.from}`}
              >
                <div className="m-av" aria-hidden="true">{incomingMessage.init}</div>
                <div className="m-body">
                  <div className="m-from">
                    <span>{incomingMessage.from}</span>
                    <span className="text-slate-400 font-normal">Just now</span>
                  </div>
                  <div className="m-txt">{incomingMessage.text}</div>
                  {scanTag && (
                    <div className="tag">
                      {scanTag.scanning && (
                        <Loader2 className="w-3 h-3 spin" aria-hidden="true" />
                      )}
                      <span>{scanTag.text}</span>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>

          {/* On-device analyzer overlay */}
          <div className={`analyzer ${analyzerVisible ? 'show' : ''}`} role="status">
            <div className="an-head flex items-center justify-between">
              <span>iQOO On-Device Classifier</span>
              <span className="text-[10px] text-teal-400 font-mono">NPU Active</span>
            </div>
            <div className="an-list">
              {CHECKS.map((c, i) => {
                const done = i < analyzerChecks;
                return (
                  <div key={c} className={`anc ${done ? 'done' : ''}`}>
                    <Check className="w-3 h-3" />
                    <span>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Sheet */}
          <div
            className={`sheet ${paymentSheetVisible ? 'show' : ''}`}
            role="dialog"
            aria-label="Payment intent confirmation"
          >
            <div className="sh-bar" aria-hidden="true"></div>
            <div className="sh-head">
              <span className="sh-amt">₹{paymentAmount?.toLocaleString('en-IN') || '48,000'}</span>
              <span className="sh-to">{paymentPayee || 'kyc-verify@upi'}</span>
            </div>
            <div className={`sh-hold ${paymentStatusColor}`}>
              <b>{paymentHeldText || 'Payment held by Bank A'}</b>
              <span>30-min TTL &bull; Cryptographic hold &bull; Reversible</span>
            </div>
          </div>

          {/* High risk alert modal */}
          <div
            className={`alert ${alertVisible ? 'show' : ''}`}
            role="alertdialog"
            aria-labelledby="alert-heading"
          >
            <div className="a-card">
              <div className="a-h" id="alert-heading">
                <AlertTriangle />
                <span>High-risk scam detected</span>
              </div>
              <div className="a-risk">
                On-device confidence: {alertConf}% &bull; Zero PII sent
              </div>

              <div className="a-reasons">
                {alertHits.map((h) => (
                  <div key={h.k} className="reason">
                    <AlertTriangle />
                    <span>{h.l}</span>
                  </div>
                ))}
              </div>

              <div className="a-btn">
                <button
                  type="button"
                  className="pri"
                  onClick={onDismissAlert}
                >
                  Don't pay
                </button>
                <button
                  type="button"
                  onClick={onDismissAlert}
                >
                  Ignore
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
