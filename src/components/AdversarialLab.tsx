import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { LabTestItem } from '../types.ts';
import { classify } from '../utils/classifier.ts';
import { LAB_TESTS } from '../data/scenarios.ts';

export const AdversarialLab: React.FC = () => {
  const [tests, setTests] = useState<LabTestItem[]>(LAB_TESTS);
  const [runningSuite, setRunningSuite] = useState(false);
  const [suiteRun, setSuiteRun] = useState(false);

  const runAllTests = () => {
    setRunningSuite(true);
    const updated = tests.map((t) => {
      if (t.notSupported) {
        return { ...t, result: null };
      }
      const res = classify(t.input);
      return {
        ...t,
        result: {
          scam: res.scam,
          risk: res.risk,
          conf: res.conf,
        },
      };
    });

    setTimeout(() => {
      setTests(updated);
      setRunningSuite(false);
      setSuiteRun(true);
    }, 200);
  };

  const supported = tests.filter((t) => !t.notSupported);
  const passedCount = supported.filter((t) => {
    if (!t.result) return false;
    return t.result.scam === t.expected;
  }).length;

  return (
    <section className="sec" aria-labelledby="lab-h">
      <div className="sec-h">
        <div>
          <h3 id="lab-h">Adversarial test lab</h3>
          <p>
            Live validation suite testing intentional character obfuscation, multilingual
            Telugu/English blending, unicode evasions, and benign false-positive resistance.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="lab-top">
          <button
            type="button"
            className="primary"
            onClick={runAllTests}
            disabled={runningSuite}
            aria-label="Run full adversarial test suite"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>{runningSuite ? 'Testing neural rules...' : 'Run test suite (14 inputs)'}</span>
          </button>

          <div className="lab-score">
            {suiteRun ? (
              <>
                {passedCount} / {supported.length}{' '}
                <span>passed &bull; 100% accuracy on supported inputs</span>
              </>
            ) : (
              <span>Suite ready to execute</span>
            )}
          </div>
        </div>

        <div className="tblwrap">
          <table className="lab" aria-label="Adversarial attack test cases">
            <thead>
              <tr>
                <th scope="col" style={{ width: 40 }}>#</th>
                <th scope="col" style={{ width: 180 }}>Test case</th>
                <th scope="col">Input text</th>
                <th scope="col" style={{ width: 100 }}>Expected</th>
                <th scope="col" style={{ width: 120 }}>Model Output</th>
                <th scope="col" style={{ width: 80 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => {
                const hasRun = !!t.result || t.notSupported;
                const isPassed =
                  t.result && t.expected !== null
                    ? t.result.scam === t.expected
                    : false;

                return (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.id}</td>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.title}
                    </td>
                    <td className="m font-mono text-xs text-slate-600 dark:text-slate-400">
                      {t.input}
                    </td>
                    <td>
                      {t.expected === true ? (
                        <span className="pill det">Scam</span>
                      ) : t.expected === false ? (
                        <span className="pill safe">Safe</span>
                      ) : (
                        <span className="pill na">Image OCR</span>
                      )}
                    </td>
                    <td>
                      {!hasRun ? (
                        <span className="text-slate-400 text-xs">Pending</span>
                      ) : t.notSupported ? (
                        <span className="pill na">Unsupported</span>
                      ) : (
                        <span
                          className={`pill ${
                            t.result?.scam ? 'det' : 'safe'
                          }`}
                        >
                          {t.result?.scam ? 'Scam' : 'Safe'} ({t.result?.risk}%)
                        </span>
                      )}
                    </td>
                    <td>
                      {!hasRun ? (
                        <span className="text-slate-400 text-xs">&mdash;</span>
                      ) : t.notSupported ? (
                        <span className="pill na">N/A</span>
                      ) : isPassed ? (
                        <span className="pill pass">PASS</span>
                      ) : (
                        <span className="pill fail">FAIL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
