import React from 'react';

export const FooterCards: React.FC = () => {
  return (
    <footer className="foot" role="contentinfo" aria-label="System architecture notes">
      <div className="fcard">
        <div className="fh">
          <span className="z impl">
            <i aria-hidden="true"></i>Implemented in prototype
          </span>
        </div>
        <p>
          On-device NLP threat classifier with unicode normalization and fuzzy matching,
          real browser Web Crypto ECDSA P-256 digital signature generation and verification,
          Noisy-OR multi-factor risk fusion, federated bank policy engine, reversible hold
          controls, and cross-tab real-time sync.
        </p>
      </div>

      <div className="fcard">
        <div className="fh">
          <span className="z sim">
            <i aria-hidden="true"></i>Simulated here
          </span>
        </div>
        <p>
          iQOO Office Kit cross-device protocol transport layer, NPCI inter-bank payment
          switch message routing, and national core banking settlement hooks.
        </p>
      </div>

      <div className="fcard">
        <div className="fh">
          <span className="z con">
            <i aria-hidden="true"></i>Production concept
          </span>
        </div>
        <p>
          Zero-Knowledge Proofs (ZKP) for multi-party mule pattern matching without exposing
          balance data, Hardware Security Module (HSM) / StrongBox key attestation on mobile
          chipsets, and formal integration with RBI MuleHunter.
        </p>
      </div>
    </footer>
  );
};
