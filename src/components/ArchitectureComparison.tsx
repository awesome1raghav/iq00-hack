import React from 'react';

export const ArchitectureComparison: React.FC = () => {
  return (
    <section className="sec" aria-labelledby="cmp-h">
      <div className="sec-h">
        <div>
          <h3 id="cmp-h">Why this is fundamentally different</h3>
          <p>
            Existing anti-fraud mechanisms kick in hours after victims report the crime. GRAPH operates
            in the critical window between scam message receipt and payment approval.
          </p>
        </div>
      </div>

      <div className="cmp">
        {/* Traditional */}
        <div className="card">
          <h4>Traditional response (Post-fraud)</h4>
          <div className="flow">
            <div className="fs">1. Victim manipulated into authorizing transaction</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">2. Money disperses across 5-7 mule accounts within seconds</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">3. ATM cash withdrawal completes in 12-15 minutes</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">4. Victim calls helpline 2 to 48 hours later</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200">
              5. Result: Irrevocable loss. Recovery rate &lt; 3%
            </div>
          </div>
          <p>
            Reactive reporting relies on the victim realizing they were scammed, by which time funds
            have already been cashed out or laundered across crypto rails.
          </p>
        </div>

        {/* GRAPH */}
        <div className="card ours">
          <h4>GRAPH workflow (Pre-transfer)</h4>
          <div className="flow">
            <div className="fs">1. On-device AI flags scam intent as message is parsed</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">2. Office Kit bridges risk profile to banking session</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">3. Zero-PII signed risk signal broadcast in &lt; 85ms</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs">4. Federated banks place reversible 30-min hold on mule hop</div>
            <div className="fa" aria-hidden="true"></div>
            <div className="fs bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 font-semibold">
              5. Result: Zero money lost. Scam neutralized before authorization.
            </div>
          </div>
          <p>
            Proactive pre-transfer containment stops the transaction at the network gateway while
            protecting user privacy and maintaining false-positive safeguards.
          </p>
        </div>
      </div>
    </section>
  );
};
