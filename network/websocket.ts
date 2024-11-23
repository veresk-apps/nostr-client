interface Params {
  createWebSocket: (url: string) => WebSocket;
}

export class Connection {
  createWebSocket: (url: string) => WebSocket;
  ws: WebSocket;

  constructor({ createWebSocket }: Params) {
    this.createWebSocket = createWebSocket;
    this.ws = this.connect();
  }

  connect() {
    return this.createWebSocket("ws://localhost:8080/");
  }

  reconnect() {
    this.ws = this.connect();
    this.registerExistingHanlers();
  }
  
  registerExistingHanlers() {
    this.ws.onerror = this.errorHanlder;
    this.ws.onmessage = this.messageHanlder;
    this.ws.onopen = this.openHanlder;
    this.ws.onclose = this.closeHanlder;
  }

  send(data: string) {
    this.ws.send(data);
  }

  errorHanlder: (event: Event) => void = () => {};
  onError(cb: (event: Event) => void) {
    this.errorHanlder = cb;
    this.ws.onerror = cb;
  }

  messageHanlder: (event: MessageEvent) => void = () => {};
  onMessage(cb: (event: MessageEvent) => void) {
    this.messageHanlder = cb;
    this.ws.onmessage = cb;
  }


  openHanlder: () => void = () => {};
  onOpen(cb: () => void) {
    this.openHanlder = cb;
    this.ws.onopen = cb;
  }

  closeHanlder: (event: CloseEvent) => void = () => {};
  onClose(cb: (event: CloseEvent) => void) {
    this.closeHanlder = cb;
    this.ws.onclose = cb;
  }
}

export function createWebSocket(url: string) {
  return new WebSocket(url);
}