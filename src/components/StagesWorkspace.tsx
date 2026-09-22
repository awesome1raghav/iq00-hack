import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Key, Clock, ShieldAlert } from 'lucide-react';
import { ClassificationResult, ScenarioContext, BankDecision } from '../types.ts';
import { ACT_LABELS } from '../data/scenarios.ts';
import { NetworkGraph } from './NetworkGraph.tsx';

interface StagesWorkspaceProps {
  currentPhase: number; // 0 to 5
  classification: ClassificationResult | null;
  fusedScore: number;
  scenarioContext: ScenarioContext | null;
  signalData: {
    id: string;
    entityHash: string;
    signature: string;
    verified: boolean;
  } | null;
  bankDecisions: BankDecision[];
  ttlSeconds: number;
  holdReleased: boolean;
  escalated: boolean;
  onReleaseHold: () => void;
  onEscalate: () => void;
  onExtendTTL: () => void;
}

export const StagesWorkspace: React.FC<StagesWorkspaceProps> = ({
  currentPhase,
  classification,
  fusedScore,
  scenarioContext,
  signalData,
  bankDecisions,
  ttlSeconds,
  holdReleased,
  escalated,
  onReleaseHold,
  onEscalate,
  onExtendTTL,
}) => {
  const formatTTL = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cards" role="region" aria-label="Investigation stages">
      {/* Stage 1: On-device classification */}
      <section
        className={`card ${currentPhase === 0 ? 'cur' : currentPhase > 0 ? 'done' : ''}`}
        aria-labelledby="st1-h"
      >
        <div className="badge-r">
          <h4 id="st1-h">01 On-device analysis</h4>
          {classification && (
            <span
              className={`z ${
                classification.scam ? 'impl' : 'impl'
              } text-xs font-semibold`}
            >
              <i aria-hidden="true"></i>
              Risk: {classification.risk}% &bull; Conf: {classification.conf}%
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Neural classifier analyzes syntax, urgency, brand impersonation, and link structures locally on the device.
        </p>

        <div className="chip-row">
          {classification && classification.hits.length > 0 ? (
            classification.hits.map((h) => (
              <span key={h.k} className="chip">
                <AlertTriangle />
                <span>{h.l}</span>
              </span>
            ))
          ) : (
            <span className="chip ok">
              <CheckCircle2 />
              <span>No social-engineering patterns detected</span>
            </span>
          )}
        </div>
      </section>

      {/* Stage 2: Payment intent & context fusion */}
      <section
        className={`card ${currentPhase === 1 ? 'cur' : currentPhase > 1 ? 'done' : ''}`}
        aria-labelledby="st2-h"
      >
        <div className="badge-r">
          <h4 id="st2-h">02 Contextual risk fusion</h4>
          <span className="z impl text-xs font-semibold">
            <i aria-hidden="true"></i>
            Fused score: {fusedScore}%
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Combines device telemetry, message threat probability, transaction velocity, and known mule history using Noisy-OR probabilistic fusion.
        </p>

        {scenarioContext && (
          <div className="ig-grid">
            <div className="ig-item">
              <div className="ig-k">Device context</div>
              <div className="ig-v">{scenarioContext.device}%</div>
              <div className="ig-bar">
                <div
                  className={`ig-bar-in ${
                    scenarioContext.device > 75
                      ? 'risk'
                      : scenarioContext.device > 40
                      ? 'warn'
                      : ''
                  }`}
                  style={{ width: `${scenarioContext.device}%` }}
                ></div>
              </div>
            </div>

            <div className="ig-item">
              <div className="ig-k">Message risk</div>
              <div className="ig-v">{classification?.risk || 0}%</div>
              <div className="ig-bar">
                <div
                  className={`ig-bar-in ${
                    (classification?.risk || 0) > 75
                      ? 'risk'
                      : (classification?.risk || 0) > 40
                      ? 'warn'
                      : ''
                  }`}
                  style={{ width: `${classification?.risk || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="ig-item">
              <div className="ig-k">Txn pattern</div>
              <div className="ig-v">{scenarioContext.txn}%</div>
              <div className="ig-bar">
                <div
                  className={`ig-bar-in ${
                    scenarioContext.txn > 75
                      ? 'risk'
                      : scenarioContext.txn > 40
                      ? 'warn'
                      : ''
                  }`}
                  style={{ width: `${scenarioContext.txn}%` }}
                ></div>
              </div>
            </div>

            <div className="ig-item">
              <div className="ig-k">Beneficiary age</div>
              <div className="ig-v">{scenarioContext.ben}%</div>
              <div className="ig-bar">
                <div
                  className={`ig-bar-in ${
                    scenarioContext.ben > 75
                      ? 'risk'
                      : scenarioContext.ben > 40
                      ? 'warn'
                      : ''
                  }`}
                  style={{ width: `${scenarioContext.ben}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="fuse">
          <div className="fuse-formula">
            Formula: <code>P(Risk) = 1 - &Pi; (1 - w_i &times; S_i)</code>
          </div>
          <div className="fuse-val font-bold">R = {fusedScore}/100</div>
        </div>
      </section>

      {/* Stage 3: Connected mule network */}
      <section
        className={`card ${currentPhase === 2 ? 'cur' : currentPhase > 2 ? 'done' : ''}`}
        aria-labelledby="st3-h"
      >
        <div className="badge-r">
          <h4 id="st3-h">03 Mule network correlation</h4>
          <span className="z sim text-xs font-semibold">
            <i aria-hidden="true"></i>
            Graph correlation: {scenarioContext?.graph || 89}%
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Traces cross-bank account paths to identify rapid fund dispersion hubs and layered mule accounts.
        </p>

        <NetworkGraph
          activePath={currentPhase >= 2 && (scenarioContext?.graph || 0) > 30}
          graphRiskScore={scenarioContext?.graph || 89}
        />
      </section>

      {/* Stage 4: Signed risk signal */}
      <section
        className={`card ${currentPhase === 3 ? 'cur' : currentPhase > 3 ? 'done' : ''}`}
        aria-labelledby="st4-h"
      >
        <div className="badge-r">
          <h4 id="st4-h">04 Signed risk signal generation</h4>
          {signalData?.verified && (
            <span className="z impl text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> ECDSA P-256 verified
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The device generates an anonymous, cryptographically signed payload using Web Crypto ECDSA P-256. Zero PII transmitted.
        </p>

        {signalData && (
          <div className="sig-grid">
            <div className="sig-box">
              <div className="sig-k">Signal ID</div>
              <div className="sig-v font-mono text-teal-600 dark:text-teal-400">
                {signalData.id}
              </div>
            </div>

            <div className="sig-box">
              <div className="sig-k">Entity Reference Hash (SHA-256)</div>
              <div className="sig-v font-mono">
                {signalData.entityHash.slice(0, 16)}...
              </div>
            </div>

            <div className="sig-box">
              <div className="sig-k">Algorithm</div>
              <div className="sig-v flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>ECDSA / P-256 / SHA-256</span>
              </div>
            </div>

            <div className="sig-box wide col-span-3">
              <div className="sig-k">ECDSA Cryptographic Signature</div>
              <div className="sig-v font-mono text-[11px] break-all">
                {signalData.signature || 'Generating keypair & signing...'}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stage 5: Multi-Bank Federation */}
      <section
        className={`card ${currentPhase === 4 ? 'cur' : currentPhase > 4 ? 'done' : ''}`}
        aria-labelledby="st5-h"
      >
        <div className="badge-r">
          <h4 id="st5-h">05 Each bank decides for itself</h4>
          <span className="z con text-xs font-semibold">
            <i aria-hidden="true"></i>
            Federated Policy Engine
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Banks independently evaluate the signed risk signal against their own local risk thresholds without exposing their decision models.
        </p>

        <div className="banks">
          {bankDecisions.map((b) => {
            const act = holdReleased ? 'REL' : b.act;
            const actInfo =
              act === 'REL'
                ? ['Released', 'Hold manually released by investigator']
                : ACT_LABELS[b.act] || ['No action', 'Within thresholds'];

            return (
              <div
                key={b.id}
                className={`bank in ${act}`}
                role="region"
                aria-label={`${b.n} policy evaluation`}
              >
                <div className="bn">{b.n}</div>
                <div className="br">{b.role}</div>
                <div className="bx">Evaluated Risk: {b.r}%</div>
                <div className="ba">{actInfo[0]}</div>
                <div className="bd">{actInfo[1]}</div>
                <div className="rule">
                  Hold &ge; {b.th.HOLD}% &bull; Verify &ge; {b.th.VERIFY}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stage 6: Temporary Containment & Reversible Controls */}
      <section
        className={`card ${currentPhase === 5 ? 'cur' : ''}`}
        aria-labelledby="st6-h"
      >
        <div className="badge-r">
          <h4 id="st6-h">06 Temporary containment &amp; review</h4>
          <span className="z impl text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 inline" /> TTL: {formatTTL(ttlSeconds)}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Reversible holds are time-bound (30 min). If not confirmed or escalated by human fraud review, the hold expires automatically without financial harm.
        </p>

        <div className="mt-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              CONTAINMENT STATE
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {holdReleased ? (
                <span className="text-teal-600 dark:text-teal-400">
                  Hold Released &bull; Funds Liquid
                </span>
              ) : escalated ? (
                <span className="text-red-600 dark:text-red-400">
                  Escalated to Cyber Cell &bull; Permanent Freeze
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Reversible Hold Active ({formatTTL(ttlSeconds)})
                </span>
              )}
            </div>
          </div>

          <div className="cbtn">
            <button
              type="button"
              className="b-rel"
              onClick={onReleaseHold}
              disabled={holdReleased}
            >
              Release hold
            </button>
            <button
              type="button"
              className="b-esc"
              onClick={onEscalate}
              disabled={escalated}
            >
              Escalate to Cyber Cell
            </button>
            <button
              type="button"
              onClick={onExtendTTL}
              disabled={holdReleased || escalated}
            >
              +15 min TTL
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
