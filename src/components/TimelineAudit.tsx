import React from 'react';
import { TimelineEvent, AuditEvent } from '../types.ts';

interface TimelineAuditProps {
  timelineEvents: TimelineEvent[];
  auditEvents: AuditEvent[];
  alertChainActive: boolean;
  signalId: string;
  riskScore: number;
  confidence: number;
  evidenceCount: number;
  currentAction: string;
  ttlSeconds: number;
  reviewNote: string;
  onConfirmFraud: () => void;
  onFalsePositive: () => void;
  onRequestVerification: () => void;
}

export const TimelineAudit: React.FC<TimelineAuditProps> = ({
  timelineEvents,
  auditEvents,
  alertChainActive,
  signalId,
  riskScore,
  confidence,
  evidenceCount,
  currentAction,
  ttlSeconds,
  reviewNote,
  onConfirmFraud,
  onFalsePositive,
  onRequestVerification,
}) => {
  const formatTTL = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="sec" aria-labelledby="timeline-h">
      <div className="sec-h">
        <div>
          <h3 id="timeline-h">Timeline &amp; audit trail</h3>
          <p>
            A complete, cryptographic record of every event from the first SMS to the final bank
            hold. Real-time review allows human operators to release, escalate, or verify.
          </p>
        </div>
      </div>

      <div className="two">
        {/* Left: Timeline */}
        <div className="card">
          <div className="badge-r">
            <h4 className="text-xl font-bold">Attack timeline</h4>
            <span className="text-xs text-slate-500 font-mono">Relative timestamps</span>
          </div>

          <div className="tl" role="list">
            {timelineEvents.length === 0 ? (
              <div className="empty">Click &quot;Start live attack&quot; to begin simulation.</div>
            ) : (
              timelineEvents.map((e) => (
                <div key={e.id} className={`tle ${e.type || ''}`} role="listitem">
                  <div className="t font-mono">+{e.offsetSeconds}s offset</div>
                  <div className="e font-medium">{e.text}</div>
                </div>
              ))
            )}
          </div>

          <div className={`chain ${alertChainActive ? 'show' : ''}`}>
            ALERT CHAIN COMPLETED &bull; ALL 3 BANKS RESPONDED IN UNDER 120ms
          </div>
        </div>

        {/* Right: Review & Audit Stream */}
        <div className="card review">
          <div className="badge-r">
            <h4 className="text-xl font-bold">Real-time fraud review</h4>
            <span className="z impl text-xs font-semibold">
              <i aria-hidden="true"></i>Human-in-the-loop
            </span>
          </div>

          <div className="rg">
            <div>
              Signal ID
              <b className="font-mono text-teal-600 dark:text-teal-400">{signalId}</b>
            </div>
            <div>
              Risk score
              <b className="text-red-600 dark:text-red-400">{riskScore}%</b>
            </div>
            <div>
              Confidence
              <b>{confidence}%</b>
            </div>
            <div>
              Evidence count
              <b>{evidenceCount} signals</b>
            </div>
            <div>
              Policy action
              <b className="text-amber-600 dark:text-amber-400">{currentAction}</b>
            </div>
            <div>
              Auto-release TTL
              <b className="font-mono">{formatTTL(ttlSeconds)}</b>
            </div>
          </div>

          <div className="rbtn">
            <button
              type="button"
              className="b-esc"
              onClick={onConfirmFraud}
            >
              Confirm fraud
            </button>
            <button
              type="button"
              className="b-rel"
              onClick={onFalsePositive}
            >
              False positive
            </button>
            <button
              type="button"
              onClick={onRequestVerification}
            >
              Request step-up
            </button>
          </div>

          <div className="rnote" aria-live="polite">
            {reviewNote}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              AUDIT LOG STREAM (IMMUTABLE)
            </div>
            <div className="audit" role="log" aria-label="System audit log stream">
              {auditEvents.map((a) => (
                <div key={a.id} className={`al ${a.type || ''}`}>
                  <span className="t font-mono text-xs">{a.time}</span>
                  <span className="e">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
