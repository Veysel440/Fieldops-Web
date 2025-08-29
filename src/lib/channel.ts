export type ChannelMsg =
  | { type: 'FIELDOPS_SYNC' }
  | { type: 'FIELDOPS_INVALIDATE'; key: Array<string | number> }
  | { type: 'QUEUE_CHANGED'; size: number }
  | { type: 'LOGOUT' };

class Channel {
  private bc?: BroadcastChannel;
  constructor(name = 'fieldops') {
    if (typeof BroadcastChannel !== 'undefined') this.bc = new BroadcastChannel(name);
  }
  post(msg: ChannelMsg) { this.bc?.postMessage(msg); }
  on(handler: (msg: ChannelMsg) => void) {
    this.bc?.addEventListener('message', (e) => handler(e.data as ChannelMsg));
  }
  close() { this.bc?.close(); }
}
export const ch = new Channel();
