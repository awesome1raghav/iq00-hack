import { SyncMessage, NetworkThreatEvent } from '../types.ts';

const CHANNEL_NAME = 'graph_threat_sync_channel';
const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9);

type Listener = (msg: SyncMessage) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  public clientId = CLIENT_ID;
  private peerCount = 1;
  private peerCheckInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error, falling back to storage:', err);
      }
    }

    // Fallback to storage event for older browsers or if BroadcastChannel is blocked
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === CHANNEL_NAME && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            if (data.clientId !== this.clientId) {
              this.handleMessage(data);
            }
          } catch {
            // ignore
          }
        }
      });
    }

    // Periodic heartbeat to count active peers
    this.startHeartbeat();
  }

  private startHeartbeat() {
    if (typeof window === 'undefined') return;
    this.peerCheckInterval = setInterval(() => {
      this.broadcast({
        type: 'SYNC_STATUS',
        payload: { ping: true },
        timestamp: Date.now(),
        clientId: this.clientId,
      });
    }, 15000);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleMessage(msg: SyncMessage) {
    if (!msg || msg.clientId === this.clientId) return;
    this.listeners.forEach((l) => {
      try {
        l(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public broadcast(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('Channel postMessage failed:', err);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(CHANNEL_NAME, JSON.stringify(msg));
      } catch {
        // ignore quota
      }
    }
  }

  public broadcastScenario(scenarioKey: string) {
    this.broadcast({
      type: 'SYNC_SCENARIO',
      payload: { scenarioKey },
      timestamp: Date.now(),
      clientId: this.clientId,
    });
  }

  public broadcastReview(decision: 'FALSE_POSITIVE' | 'CONFIRMED_FRAUD' | 'EXTEND' | 'VERIFY', signalId: string) {
    this.broadcast({
      type: 'SYNC_REVIEW',
      payload: { decision, signalId },
      timestamp: Date.now(),
      clientId: this.clientId,
    });
  }

  public broadcastNetworkThreat(event: NetworkThreatEvent) {
    this.broadcast({
      type: 'SYNC_NETWORK_EVENT',
      payload: event,
      timestamp: Date.now(),
      clientId: this.clientId,
    });
  }
}

export const syncManager = new RealtimeSyncManager();
