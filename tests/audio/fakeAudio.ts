/** Web Audio falso, mínimo, para testes do motor. */
class FakeParam {
  value = 0;
  readonly calls: [string, number, number?][] = [];
  setValueAtTime(v: number, t: number): this { this.value = v; this.calls.push(['set', v, t]); return this; }
  linearRampToValueAtTime(v: number, t: number): this { this.calls.push(['lin', v, t]); return this; }
  exponentialRampToValueAtTime(v: number, t: number): this { this.calls.push(['exp', v, t]); return this; }
  setTargetAtTime(v: number, _t: number): this { this.value = v; return this; }
}

class FakeNode {
  readonly outputs: FakeNode[] = [];
  connect<T extends FakeNode>(n: T): T { this.outputs.push(n); return n; }
  disconnect(): void { this.outputs.length = 0; }
}

class FakeSource extends FakeNode {
  started = false;
  start(): void { this.started = true; }
  stop(): void {}
}

export class FakeOscillator extends FakeSource {
  type = 'sine';
  readonly frequency = new FakeParam();
}

export class FakeAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  currentTime = 0;
  readonly sampleRate = 8000;
  readonly destination = new FakeNode();
  readonly oscillators: FakeOscillator[] = [];
  readonly gains: { gain: FakeParam }[] = [];
  resumeCalls = 0;
  /** Se true, `resume()` passa o estado para running na hora (simula gesto aceito). */
  autoRun = true;

  resume(): Promise<void> {
    this.resumeCalls++;
    if (this.autoRun) this.state = 'running';
    return Promise.resolve();
  }
  createOscillator(): FakeOscillator { const o = new FakeOscillator(); this.oscillators.push(o); return o; }
  createGain(): FakeNode & { gain: FakeParam } {
    const g = Object.assign(new FakeNode(), { gain: new FakeParam() });
    this.gains.push(g);
    return g;
  }
  createBiquadFilter(): FakeNode { return Object.assign(new FakeNode(), { type: 'lowpass', frequency: new FakeParam(), Q: new FakeParam() }); }
  createBufferSource(): FakeSource { return Object.assign(new FakeSource(), { buffer: null, playbackRate: new FakeParam() }); }
  createStereoPanner(): FakeNode { return Object.assign(new FakeNode(), { pan: new FakeParam() }); }
  createDynamicsCompressor(): FakeNode {
    return Object.assign(new FakeNode(), {
      threshold: new FakeParam(), knee: new FakeParam(), ratio: new FakeParam(), attack: new FakeParam(), release: new FakeParam(),
    });
  }
  createBuffer(_ch: number, len: number): { getChannelData: () => Float32Array } {
    const data = new Float32Array(len);
    return { getChannelData: () => data };
  }
}

export function fakeFactory(): { ctx: FakeAudioContext; createContext: () => AudioContext; created: () => number } {
  const ctx = new FakeAudioContext();
  let n = 0;
  return { ctx, createContext: () => { n++; return ctx as unknown as AudioContext; }, created: () => n };
}
