import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { Controls } from './components/Controls.tsx';
import { Stepper } from './components/Stepper.tsx';
import { Narrative } from './components/Narrative.tsx';
import { PhoneSimulator } from './components/PhoneSimulator.tsx';
import { StagesWorkspace } from './components/StagesWorkspace.tsx';
import { OutcomeBanner } from './components/OutcomeBanner.tsx';
import { TimelineAudit } from './components/TimelineAudit.tsx';
import { LatencyBenchmark } from './components/LatencyBenchmark.tsx';
import { PrivacyFirewall } from './components/PrivacyFirewall.tsx';
import { ArchitectureComparison } from './components/ArchitectureComparison.tsx';
import { AdversarialLab } from './components/AdversarialLab.tsx';
import { FooterCards } from './components/FooterCards.tsx';

import { SCENARIOS, BANKS } from './data/scenarios.ts';
import { ThreatCategory, ClassificationResult, BankDecision, TimelineEvent, AuditEvent } from './types.ts';
import { classify, fuse } from './utils/classifier.ts';
import { getOrGenerateKeyPair, sha256, signData, verifySignature } from './utils/crypto.ts';
import { syncManager } from './utils/sync.ts';

export const App: React.FC = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('graph_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('graph_theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('graph_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Sync state
  const [syncConnected, setSyncConnected] = useState(true);

  // Simulation state
  const [running, setRunning] = useState(false);
  const [curScenarioKey, setCurScenarioKey] = useState<string>('kyc');
  const [phaseIndex, setPhaseIndex] = useState<number>(-1);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [narrativeText, setNarrativeText] = useState<string>(
    'Select a scenario and click <em>Start live attack</em> to observe on-device classification and multi-bank containment.'
  );

  // Phone state
  const [shaking, setShaking] = useState(false);
  const [guardState, setGuardState] = useState<'idle' | 'scanning' | 'threat' | 'safe'>('idle');
  const [incomingMessage, setIncomingMessage] = useState<{
    from: string;
    init: string;
    text: string;
  } | null>(null);
  const [scanTag, setScanTag] = useState<{
    text: string;
    scanning: boolean;
    scam: boolean;
    safe: boolean;
  } | null>(null);
  const [analyzerVisible, setAnalyzerVisible] = useState(false);
  const [analyzerChecks, setAnalyzerChecks] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertHits, setAlertHits] = useState<ThreatCategory[]>([]);
  const [alertConf, setAlertConf] = useState(94);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [paymentHeldText, setPaymentHeldText] = useState('Checking this payment');
  const [paymentStatusColor, setPaymentStatusColor] = useState<'red' | 'amber' | 'green'>('amber');
  const [packetMoving, setPacketMoving] = useState(false);

  // Investigation & Bank Federation
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [fusedScore, setFusedScore] = useState<number>(0);
  const [signalData, setSignalData] = useState<{
    id: string;
    entityHash: string;
    signature: string;
    verified: boolean;
  } | null>(null);
  const [bankDecisions, setBankDecisions] = useState<BankDecision[]>(
    BANKS.map((b) => ({ ...b, r: 0, act: 'NONE' }))
  );
  const [holdReleased, setHoldReleased] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [ttlSeconds, setTtlSeconds] = useState(1800); // 30 minutes
  const [outcomeVisible, setOutcomeVisible] = useState(false);

  // Timeline & Audit Stream
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    { id: '1', time: '10:42:00', text: 'GRAPH agent daemon initialized on iQOO NPU' },
    { id: '2', time: '10:42:01', text: 'Office Kit cross-device trust pipe established' },
  ]);
  const [alertChainActive, setAlertChainActive] = useState(false);
  const [reviewNote, setReviewNote] = useState('Pending human review or TTL auto-release');
  const [currentAction, setCurrentAction] = useState('MONITOR');

  // Timers ref for clean cancellation
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const ttlIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (ttlIntervalRef.current) {
      clearInterval(ttlIntervalRef.current);
      ttlIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Helper to add timed action
  const addTimer = useCallback((delay: number, fn: () => void) => {
    const t = setTimeout(fn, delay);
    timersRef.current.push(t);
  }, []);

  const addAudit = useCallback((text: string, type: 'r' | 'g' | 'a' | '' = '') => {
    const d = new Date();
    const time = d.toTimeString().split(' ')[0];
    setAuditEvents((prev) => [{ id: Math.random().toString(), time, text, type }, ...prev]);
  }, []);

  const addTimeline = useCallback((text: string, offsetSeconds: number, type: 'r' | 'g' | 'a' | '' = '') => {
    setTimelineEvents((prev) => [...prev, { id: Math.random().toString(), text, offsetSeconds, type }]);
  }, []);

  // Sync Manager Listener
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((msg) => {
      if (msg.type === 'SYNC_SCENARIO') {
        if (msg.payload?.scenarioKey && SCENARIOS[msg.payload.scenarioKey]) {
          setCurScenarioKey(msg.payload.scenarioKey);
          addAudit(`[Real-time Sync] Peer switched active scenario to ${msg.payload.scenarioKey}`, 'a');
        }
      } else if (msg.type === 'SYNC_REVIEW') {
        if (msg.payload?.decision === 'FALSE_POSITIVE') {
          setHoldReleased(true);
          setPaymentStatusColor('green');
          setReviewNote('False positive signal broadcasted across federated network');
          addAudit(`[Real-time Sync] Signal ${msg.payload.signalId} released via multi-tab review`, 'g');
        } else if (msg.payload?.decision === 'CONFIRMED_FRAUD') {
          setEscalated(true);
          setReviewNote('Fraud confirmed by remote reviewer. Escalated to Cyber Cell');
          addAudit(`[Real-time Sync] Signal ${msg.payload.signalId} confirmed as fraud`, 'r');
        }
      }
    });

    return () => unsubscribe();
  }, [addAudit]);

  // Reset simulation view
  const resetSimulation = useCallback(() => {
    clearAllTimers();
    setRunning(false);
    setPhaseIndex(-1);
    setStatusText('Ready');
    setNarrativeText('Select a scenario and click <em>Start live attack</em> to observe on-device classification and multi-bank containment.');
    setShaking(false);
    setGuardState('idle');
    setIncomingMessage(null);
    setScanTag(null);
    setAnalyzerVisible(false);
    setAnalyzerChecks(0);
    setAlertVisible(false);
    setPaymentSheetVisible(false);
    setPaymentHeldText('Checking this payment');
    setPaymentStatusColor('amber');
    setPacketMoving(false);
    setClassification(null);
    setFusedScore(0);
    setSignalData(null);
    setBankDecisions(BANKS.map((b) => ({ ...b, r: 0, act: 'NONE' })));
    setHoldReleased(false);
    setEscalated(false);
    setTtlSeconds(1800);
    setOutcomeVisible(false);
    setTimelineEvents([]);
    setAlertChainActive(false);
    setReviewNote('Pending human review or TTL auto-release');
    setCurrentAction('MONITOR');
  }, [clearAllTimers]);

  // Start TTL countdown
  const startTTL = useCallback(() => {
    if (ttlIntervalRef.current) clearInterval(ttlIntervalRef.current);
    ttlIntervalRef.current = setInterval(() => {
      setTtlSeconds((prev) => {
        if (prev <= 1) {
          if (ttlIntervalRef.current) clearInterval(ttlIntervalRef.current);
          setHoldReleased(true);
          setPaymentStatusColor('green');
          setReviewNote('Hold automatically expired via 30-min TTL. Zero victim loss.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Run the full simulation sequence
  const startSimulation = useCallback(async () => {
    resetSimulation();
    setRunning(true);
    const scenario = SCENARIOS[curScenarioKey];
    syncManager.broadcastScenario(curScenarioKey);

    setStatusText(scenario.safe ? 'Checking benign flow' : 'Live incident underway');

    // T = 500ms: Message arrives
    addTimer(500, () => {
      setPhaseIndex(0);
      setNarrativeText('A new message arrives. <em>GRAPH checks it instantly, on the phone.</em>');
      setIncomingMessage({
        from: scenario.from,
        init: scenario.init,
        text: scenario.text,
      });
      setScanTag({
        text: 'Checking on device',
        scanning: true,
        scam: false,
        safe: false,
      });
      addTimeline(scenario.safe ? 'Message received' : 'Suspicious SMS received', 0);
      addAudit('Notification received on device');
    });

    // T = 1500ms: Analyzer opens
    addTimer(1500, () => {
      setAnalyzerVisible(true);
      setAnalyzerChecks(0);
      addTimeline('GRAPH analysis started on NPU', 2);
      addAudit('On-device analysis started');
      setNarrativeText('The message is analysed <em>on the device</em>. Its content never leaves the phone.');
    });

    // T = 1900ms .. 3220ms: Checks complete
    [0, 1, 2, 3, 4].forEach((i) => {
      addTimer(1900 + i * 330, () => {
        setAnalyzerChecks(i + 1);
      });
    });

    // T = 3700ms: Classification results
    addTimer(3700, () => {
      const cls = classify(scenario.text);
      setClassification(cls);

      if (cls.scam) {
        setGuardState('threat');
        setScanTag({
          text: `Risk ${cls.risk} · likely scam`,
          scanning: false,
          scam: true,
          safe: false,
        });
        addAudit(`Message risk calculated: ${cls.risk} · confidence ${cls.conf}%`, 'a');
      } else {
        setGuardState('safe');
        setScanTag({
          text: `Safe · risk ${cls.risk}`,
          scanning: false,
          scam: false,
          safe: true,
        });
        addAudit(`Message risk calculated: ${cls.risk} · confidence ${cls.conf}%`, 'g');
      }
    });

    // If safe message scenario
    if (scenario.safe) {
      addTimer(4500, () => {
        setAnalyzerVisible(false);
        addTimeline('No threat · benign bill notification', 5, 'g');
        addAudit('Status SAFE · no signal created · funds liquid', 'g');
        setNarrativeText('Risk 6 out of 100. <em>A real bill, so nothing is blocked.</em> GRAPH only acts when it matters.');
        setStatusText('Safe · no action');
        setRunning(false);
      });
      return;
    }

    // High risk threat path
    addTimer(4400, () => {
      addTimeline('High-risk social-engineering pattern detected', 3, 'r');
      addAudit('High-risk social-engineering pattern detected', 'r');
    });

    // T = 5000ms: Phone warning alert
    addTimer(5000, () => {
      setAnalyzerVisible(false);
      const cls = classify(scenario.text);
      setAlertHits(cls.hits);
      setAlertConf(cls.conf);
      setAlertVisible(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([120, 60, 120]);
      }
      setNarrativeText('<em>Likely scam.</em> The phone warns the user and explains exactly why.');
    });

    // T = 8000ms: User attempts payment anyway
    addTimer(8000, () => {
      setAlertVisible(false);
      if (scenario.ev) {
        scenario.ev.forEach((e) => {
          addTimeline(e[0], e[1], e[2]);
          addAudit(e[0], e[2] === 'r' ? 'r' : 'a');
        });
      }
    });

    // T = 9000ms: UPI payment intent sheet pops up
    addTimer(9000, () => {
      setPhaseIndex(1);
      setPaymentSheetVisible(true);
      setPaymentHeldText('Checking this payment');
      setPaymentStatusColor('amber');
      addTimeline('UPI app payment intent opened', 186, 'a');
      setNarrativeText('The user tries to pay anyway. <em>GRAPH links the payment to the scam.</em>');
    });

    // T = 9700ms .. 10900ms: Factor calculations
    addTimer(9700, () => {
      addTimeline(`Payment intent detected · ₹${scenario.amount?.toLocaleString('en-IN')}`, 190, 'a');
      addAudit(`Payment intent detected · ₹${scenario.amount?.toLocaleString('en-IN')}`, 'a');
    });

    // T = 11500ms: Graph correlation & Multi-factor fusion
    addTimer(11500, () => {
      setPhaseIndex(2);
      addAudit('Graph correlation triggered across banking mesh');
      setNarrativeText('The payee is traced through the network. <em>It leads to a mule account.</em>');

      const cls = classify(scenario.text);
      const comb = fuse({
        device: scenario.ctx.device,
        message: cls.risk,
        txn: scenario.ctx.txn,
        ben: scenario.ctx.ben,
        graph: scenario.ctx.graph,
      });

      setFusedScore(comb);

      setTimeout(() => {
        addTimeline(`Transaction risk escalated · combined ${comb}/100`, 192, 'r');
        setAlertChainActive(true);
        addAudit(`Risk escalated · combined ${comb}`, 'r');
      }, 500);
    });

    // T = 15200ms: Cryptographic signal generated with Web Crypto ECDSA
    addTimer(15200, async () => {
      setPhaseIndex(3);
      const signalId = 'KX-' + (10000 + Math.floor(Math.random() * 89999));
      setNarrativeText('A <em>trusted signal</em> is created and signed. It carries a score, not the message.');

      const entityHash = 'sha256:' + (await sha256(scenario.payee || 'unknown')).slice(0, 16);
      const cls = classify(scenario.text);
      const comb = fuse({
        device: scenario.ctx.device,
        message: cls.risk,
        txn: scenario.ctx.txn,
        ben: scenario.ctx.ben,
        graph: scenario.ctx.graph,
      });

      const payloadObj = {
        signal_id: signalId,
        risk_score: comb,
        confidence: Math.min(97, cls.conf + 2),
        threat_category: 'SOCIAL_ENGINEERING',
        issuer: 'GRAPH / participating device',
        timestamp: new Date().toISOString(),
        ttl_minutes: 30,
        entity_ref: entityHash,
      };

      const payloadStr = JSON.stringify(payloadObj);
      const keyPair = await getOrGenerateKeyPair();
      const signature = await signData(payloadStr, keyPair);
      const verified = await verifySignature(payloadStr, signature, keyPair);

      setSignalData({
        id: signalId,
        entityHash,
        signature,
        verified,
      });

      addTimeline(`Signal ${signalId} created with ECDSA P-256`, 193, 'r');
      addAudit(`Signal ${signalId} created · pending propagation`, 'r');
    });

    // T = 16400ms: Office Kit packet travel animation
    addTimer(16400, () => {
      setPacketMoving(true);
      setTimeout(() => setPacketMoving(false), 1300);
      addAudit('Signal authenticated by inter-bank exchange', 'g');
    });

    // T = 19400ms: Multi-Bank Federation
    addTimer(19400, () => {
      setPhaseIndex(4);
      setNarrativeText('Three banks receive the same signal. <em>Each applies its own policy.</em>');

      const cls = classify(scenario.text);
      const comb = fuse({
        device: scenario.ctx.device,
        message: cls.risk,
        txn: scenario.ctx.txn,
        ben: scenario.ctx.ben,
        graph: scenario.ctx.graph,
      });

      const decisions: BankDecision[] = BANKS.map((b) => {
        const r = Math.max(0, comb + b.off);
        let act: 'HOLD' | 'VERIFY' | 'MONITOR' | 'NONE' = 'NONE';
        if (r >= b.th.HOLD) act = 'HOLD';
        else if (r >= b.th.VERIFY) act = 'VERIFY';
        else if (r >= b.th.MONITOR) act = 'MONITOR';
        return { ...b, r, act };
      });

      setBankDecisions(decisions);

      decisions.forEach((b) => {
        addAudit(
          `${b.n} applied policy: ${b.act} (local risk: ${b.r}%)`,
          b.act === 'HOLD' ? 'r' : b.act === 'VERIFY' ? 'a' : 'g'
        );
      });
    });

    // T = 22200ms: Containment & Hold
    addTimer(22200, () => {
      setPhaseIndex(5);
      setPaymentHeldText(`Held by Bank A · 30 min TTL`);
      setPaymentStatusColor('red');
      startTTL();
      setCurrentAction('HOLD');
      addAudit('Temporary containment active · TTL 30:00 countdown started', 'r');
      setNarrativeText('The risky transfer is on a <em>temporary, reversible</em> hold, with a countdown and review.');
    });

    // T = 23600ms: Outcome Banner
    addTimer(23600, () => {
      setOutcomeVisible(true);
      setRunning(false);
      setStatusText('Contained · reversible');
      setNarrativeText('One phone caught it. <em>Three banks responded.</em> Every action can be reviewed and reversed.');
      addAudit('Incident contained · audit trail complete', 'g');
    });
  }, [
    curScenarioKey,
    resetSimulation,
    addTimer,
    addTimeline,
    addAudit,
    startTTL,
  ]);

  // Review actions
  const handleConfirmFraud = () => {
    if (!signalData) return;
    setEscalated(true);
    setReviewNote('Fraud confirmed by operator. Mules blacklisted across all 3 banks.');
    addAudit(`Signal ${signalData.id} confirmed fraudulent &bull; Mules blacklisted`, 'r');
    syncManager.broadcastReview('CONFIRMED_FRAUD', signalData.id);
  };

  const handleFalsePositive = () => {
    if (!signalData) return;
    setHoldReleased(true);
    setPaymentStatusColor('green');
    setPaymentHeldText('Payment released · Verified benign');
    setReviewNote('Hold manually released. Marked as false positive.');
    addAudit(`Signal ${signalData.id} marked FALSE POSITIVE &bull; Hold released`, 'g');
    syncManager.broadcastReview('FALSE_POSITIVE', signalData.id);
  };

  const handleRequestVerification = () => {
    if (!signalData) return;
    setPaymentHeldText('Step-up biometric verification required');
    setPaymentStatusColor('amber');
    setReviewNote('Step-up verification challenge issued to user.');
    addAudit(`Step-up verification requested for signal ${signalData.id}`, 'a');
  };

  const handleExtendTTL = () => {
    setTtlSeconds((prev) => prev + 900);
    setReviewNote('TTL extended by 15 minutes for investigator analysis.');
    addAudit('Hold TTL extended by 15 minutes', 'a');
  };

  const handleTestSync = () => {
    syncManager.broadcast({
      type: 'SYNC_STATUS',
      payload: { beacon: true },
      timestamp: Date.now(),
      clientId: syncManager.clientId,
    });
    addAudit('[Real-time Sync] Broadcast beacon transmitted across active browser tabs', 'g');
  };

  const scenario = SCENARIOS[curScenarioKey];

  // Prepare signal JSON string for privacy firewall
  const signalJsonPreview = JSON.stringify(
    {
      signal_id: signalData?.id || 'KX-94182',
      risk_score: fusedScore || (classification?.risk ? classification.risk + 8 : 94),
      confidence: classification ? Math.min(97, classification.conf + 2) : 94,
      threat_category: 'SOCIAL_ENGINEERING',
      issuer: 'GRAPH / participating device',
      timestamp: new Date().toISOString(),
      ttl_minutes: 30,
      entity_ref: signalData?.entityHash || 'sha256:8f4c2e10a9b3',
      ecdsa_p256_sig: signalData?.signature
        ? signalData.signature.slice(0, 32) + '...'
        : '3045022100a98f...Verified',
    },
    null,
    2
  );

  return (
    <div className="wrap">
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        syncConnected={syncConnected}
        onTestSync={handleTestSync}
      />

      {/* Hero */}
      <Hero />

      {/* Controls */}
      <Controls
        running={running}
        activeScenarioKey={curScenarioKey}
        onStart={startSimulation}
        onStop={resetSimulation}
        onSelectScenario={(k) => {
          setCurScenarioKey(k);
          if (running) resetSimulation();
        }}
        statusText={statusText}
      />

      {/* Stepper */}
      <Stepper currentPhaseIndex={phaseIndex} />

      {/* Narrative */}
      <Narrative text={narrativeText} />

      {/* Main Interactive Stage */}
      <main className="stage" role="main">
        {/* Left column: Phone simulator */}
        <PhoneSimulator
          shaking={shaking}
          guardState={guardState}
          incomingMessage={incomingMessage}
          scanTag={scanTag}
          analyzerVisible={analyzerVisible}
          analyzerChecks={analyzerChecks}
          alertVisible={alertVisible}
          alertHits={alertHits}
          alertRisk={classification?.risk || 90}
          alertConf={alertConf}
          onDismissAlert={() => setAlertVisible(false)}
          paymentSheetVisible={paymentSheetVisible}
          paymentAmount={scenario.amount}
          paymentPayee={scenario.payee}
          paymentHeldText={paymentHeldText}
          paymentStatusColor={paymentStatusColor}
        />

        {/* Center column: Office Kit Bridge */}
        <aside className="bridge" aria-label="Office Kit IPC Bridge">
          <div className="lane" aria-hidden="true">
            <div className={`packet ${packetMoving ? 'go' : ''}`}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M12 2L4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z"
                  stroke="#DCC790"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <span className="bridge-lbl">OFFICE KIT BRIDGE</span>
        </aside>

        {/* Right column: 6 Investigation Stages */}
        <StagesWorkspace
          currentPhase={phaseIndex}
          classification={classification}
          fusedScore={fusedScore}
          scenarioContext={scenario.ctx}
          signalData={signalData}
          bankDecisions={bankDecisions}
          ttlSeconds={ttlSeconds}
          holdReleased={holdReleased}
          escalated={escalated}
          onReleaseHold={handleFalsePositive}
          onEscalate={handleConfirmFraud}
          onExtendTTL={handleExtendTTL}
        />
      </main>

      {/* Outcome Banner */}
      <OutcomeBanner
        visible={outcomeVisible}
        signalId={signalData?.id || 'KX-94182'}
        amount={scenario.amount || 48000}
        entitiesCount={3}
        durationSeconds={ttlSeconds}
        latencyMs={84}
      />

      {/* Timeline & Audit Trail */}
      <TimelineAudit
        timelineEvents={timelineEvents}
        auditEvents={auditEvents}
        alertChainActive={alertChainActive}
        signalId={signalData?.id || 'KX-94182'}
        riskScore={fusedScore || classification?.risk || 94}
        confidence={classification?.conf || 91}
        evidenceCount={classification?.hits.length || 4}
        currentAction={holdReleased ? 'RELEASED' : currentAction}
        ttlSeconds={ttlSeconds}
        reviewNote={reviewNote}
        onConfirmFraud={handleConfirmFraud}
        onFalsePositive={handleFalsePositive}
        onRequestVerification={handleRequestVerification}
      />

      {/* Latency Benchmarks */}
      <LatencyBenchmark />

      {/* Zero-PII Privacy Firewall */}
      <PrivacyFirewall
        currentScenarioText={scenario.text}
        signalJson={signalJsonPreview}
      />

      {/* Architecture Comparison: Traditional vs GRAPH */}
      <ArchitectureComparison />

      {/* Adversarial Test Lab */}
      <AdversarialLab />

      {/* Footer Notes */}
      <FooterCards />
    </div>
  );
};

export default App;
