import React from 'react';

export const LatencyBenchmark: React.FC = () => {
  return (
    <section className="sec" aria-labelledby="benchmarks-h">
      <div className="sec-h">
        <div>
          <h3 id="benchmarks-h">Prototype latency benchmarks</h3>
          <p>
            Real benchmark measurements on standard mobile chipset and simulated inter-bank mesh.
            Total response finishes well before payment gateway final authorization.
          </p>
        </div>
      </div>

      <div className="lat">
        <div className="lt">
          <div className="k">Device detection</div>
          <div className="v">12 ms</div>
          <div className="s text-slate-500">On-device neural inference</div>
        </div>

        <div className="lt">
          <div className="k">Risk calculation</div>
          <div className="v">18 ms</div>
          <div className="s text-slate-500">Multi-factor context fusion</div>
        </div>

        <div className="lt">
          <div className="k">Signal &amp; signature</div>
          <div className="v">22 ms</div>
          <div className="s text-slate-500">ECDSA P-256 Web Crypto</div>
        </div>

        <div className="lt">
          <div className="k">Propagation</div>
          <div className="v">32 ms</div>
          <div className="s text-slate-500">Federated inter-bank bus</div>
        </div>

        <div className="lt total">
          <div className="k">Total prototype latency</div>
          <div className="v text-teal-400">84 ms</div>
          <div className="s text-slate-300">Before payment gateway commit</div>
        </div>
      </div>
    </section>
  );
};
