import React from 'react';

interface OutcomeBannerProps {
  visible: boolean;
  signalId: string;
  amount: number;
  entitiesCount: number;
  durationSeconds: number;
  latencyMs: number;
}

export const OutcomeBanner: React.FC<OutcomeBannerProps> = ({
  visible,
  signalId,
  amount,
  entitiesCount,
  durationSeconds,
  latencyMs,
}) => {
  const formatTTL = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`outcome ${visible ? 'show' : ''}`}
      role="region"
      aria-label="Incident containment outcome"
    >
      <div className="o-top">
        <div>
          <div className="ok">INCIDENT OUTCOME &bull; REVERSIBLE HOLD APPLIED</div>
          <h2>
            Incident contained. <em>Before the money moved.</em>
          </h2>
        </div>
        <div className="o-id">{signalId}</div>
      </div>

      <div className="o-grid">
        <div>
          <div className="v">₹{amount.toLocaleString('en-IN')}</div>
          <div className="k">Simulated exposure contained</div>
        </div>
        <div>
          <div className="v">{entitiesCount}</div>
          <div className="k">Connected entities contained</div>
        </div>
        <div>
          <div className="v">{formatTTL(durationSeconds)}</div>
          <div className="k">Hold duration (auto-release TTL)</div>
        </div>
        <div>
          <div className="v">{latencyMs} ms</div>
          <div className="k">Detection to signal generation</div>
        </div>
      </div>

      <div className="o-close">
        The victim&apos;s money never left their account. The beneficiary&apos;s account was
        held before cashout. <em>Zero personal data left the device.</em>
      </div>
    </div>
  );
};
