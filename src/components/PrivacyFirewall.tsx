import React from 'react';
import { X, Check } from 'lucide-react';

interface PrivacyFirewallProps {
  currentScenarioText: string;
  signalJson: string;
}

export const PrivacyFirewall: React.FC<PrivacyFirewallProps> = ({
  currentScenarioText,
  signalJson,
}) => {
  return (
    <section className="sec" aria-labelledby="privacy-h">
      <div className="sec-h">
        <div>
          <h3 id="privacy-h">Share intelligence, not identity</h3>
          <p>
            Zero-knowledge telemetry. The raw scam message, victim name, sender number, and bank
            credentials never leave the phone. Only cryptographically blinded features propagate.
          </p>
        </div>
      </div>

      <div className="priv">
        {/* Left: Stays on phone */}
        <div className="pv stay">
          <h4>Stays on phone</h4>
          <div className="it">
            <X className="text-red-500" />
            <span>Raw SMS / chat message body</span>
          </div>
          <div className="it">
            <X className="text-red-500" />
            <span>Sender phone number and contact book</span>
          </div>
          <div className="it">
            <X className="text-red-500" />
            <span>Bank account numbers &amp; IFSC</span>
          </div>
          <div className="it">
            <X className="text-red-500" />
            <span>IMEI and hardware serials</span>
          </div>

          <div className="msgbox">
            <div className="text-xs font-semibold mb-1 text-slate-500">
              RAW LOCAL STORAGE (REDACTED AT BOUNDARY)
            </div>
            <div className="italic text-slate-400 dark:text-slate-500 text-xs">
              &quot;{currentScenarioText}&quot;
            </div>
            <div className="rd w-3/4"></div>
            <div className="rd w-1/2"></div>
          </div>
        </div>

        {/* Center: Firewall */}
        <div className="fwall" aria-hidden="true">
          <div className="bar"></div>
          <span>ZERO-PII FIREWALL</span>
          <div className="bar"></div>
        </div>

        {/* Right: Leaves as a signal */}
        <div className="pv send">
          <h4>Leaves as a signal</h4>
          <div className="it">
            <Check className="text-teal-500" />
            <span>One-way SHA-256 entity digest</span>
          </div>
          <div className="it">
            <Check className="text-teal-500" />
            <span>Abstract category threat bitmask</span>
          </div>
          <div className="it">
            <Check className="text-teal-500" />
            <span>Probabilistic fused risk score (0-100)</span>
          </div>
          <div className="it">
            <Check className="text-teal-500" />
            <span>ECDSA P-256 Web Crypto signature</span>
          </div>

          <pre className="json" tabIndex={0} aria-label="Cryptographic signal JSON payload">
            {signalJson}
          </pre>
        </div>
      </div>
    </section>
  );
};
