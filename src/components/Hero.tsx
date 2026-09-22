import React from 'react';
import { Cpu, Smartphone, ShieldCheck } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div>
        <h1 id="hero-heading">
          The scam starts on one phone. The response reaches <em>every bank</em>.
        </h1>
        <p className="lede">
          When someone receives a scam message, their phone detects the social engineering
          locally. GRAPH converts that intent into a signed, zero-PII risk signal and propagates
          it across banks to freeze mule accounts before money moves.
        </p>
      </div>

      <div className="pillars" role="region" aria-label="Core architecture pillars">
        <div className="pillar">
          <div className="ic" aria-hidden="true">
            <Cpu />
          </div>
          <div>
            <b>On-device AI</b>
            <span>
              Text &amp; context classified on the device. Raw messages, names, and phone numbers
              never leave the device.
            </span>
          </div>
        </div>

        <div className="pillar">
          <div className="ic" aria-hidden="true">
            <Smartphone />
          </div>
          <div>
            <b>Office Kit bridge</b>
            <span>
              Simulates vivo / iQOO Office Kit protocol bridging the phone alert to the
              victim's banking apps and federated network.
            </span>
          </div>
        </div>

        <div className="pillar">
          <div className="ic" aria-hidden="true">
            <ShieldCheck />
          </div>
          <div>
            <b>Explainable &amp; reversible</b>
            <span>
              Every freeze carries a signed cryptographic trail, confidence breakdown, and a
              30-minute automatic TTL.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
