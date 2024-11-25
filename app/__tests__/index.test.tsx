import { render, screen, userEvent } from "@testing-library/react-native";
import Index from "../index";
import { Connection, ConnectionStatus } from "@/network/websocket";
import { createWebSocketMock } from "@/utils/test-utils";
import { act } from "react";
import { KeyPair } from "@/utils/key-pair";
import { DeviceStotage } from "@/utils/key-store";
import { createGenericEvent, EventKind, signEvent } from "@/utils/events";
import { createMessage, MessageType } from "@/network/messages";

interface RenderIndexProps {
  createConnection?: () => ConnectionMock;
  generateKeyPair?: () => KeyPair;
  restoreKeyPair?: () => KeyPair;
  deviceStorage?: DeviceStotage;
}

function renderIndex({
  createConnection = () => new ConnectionMock(),
  generateKeyPair = generateKeyPairMock,
  restoreKeyPair = restoreKeyPairMock,
  deviceStorage = new DeviceStoreMock(),
}: RenderIndexProps = {}) {
  const connection = createConnection();
  render(
    <Index
      createConnection={() => connection}
      generateKeyPair={generateKeyPair}
      restoreKeyPair={restoreKeyPair}
      createDeviceStore={() => deviceStorage}
    />
  );
  return { connection, deviceStorage };
}

describe("Index", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(jest.fn());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should render 'Connected' if connectio status is open", async () => {
    const connection = new ConnectionMock({ status: "open" });
    const createConnection = () => connection;
    renderIndex({ createConnection });
    await screen.findByText("Connected");
  });

  it("should render 'Connected' after connection is open", async () => {
    const connection = new ConnectionMock({ status: "closed" });
    const createConnection = () => connection;
    renderIndex({ createConnection });
    screen.getByText("Disconnected");
    act(() => {
      connection.handlers.simulateOpen();
    });
    await screen.findByText("Connected");
  });

  it("should render 'Disconnected' after connection closes", async () => {
    const { connection } = renderIndex();
    act(() => {
      connection.handlers.simulateOpen();
    });
    await screen.findByText("Connected");
    act(() => {
      connection.handlers.simulateClose();
    });
    await screen.findByText("Disconnected");
  });

  it("should call connection handlers", async () => {
    const { connection } = renderIndex();
    await screen.findByText("Public key: genrtd");
    expect(connection.onOpen).toHaveBeenCalled();
    expect(connection.onMessage).toHaveBeenCalled();
    expect(connection.onError).toHaveBeenCalled();
    expect(connection.onClose).toHaveBeenCalled();
  });

  it("should send an event on send button click", async () => {
    const { connection } = renderIndex();
    await screen.findByText("Public key: genrtd");
    await userEvent.press(screen.getByText("Send"));
    const event = createGenericEvent({
      kind: EventKind.TextNote,
      pubkey: "genrtd-pubkey",
      content: "hello, world from ios",
    });
    const signedEvent = await signEvent({
      event,
      privateKey: new Uint8Array(),
    });
    const eventMessage = createMessage({
      signedEvent,
      type: MessageType.Event,
    });
    expect(connection.send).toHaveBeenCalledWith(eventMessage);
  });

  it("should display public key", async () => {
    renderIndex();
    await screen.findByText("Public key: genrtd");
  });

  it("should save generated private key hex in device storage", async () => {
    const { deviceStorage } = renderIndex();
    await screen.findByText("Public key: genrtd");
    expect(await deviceStorage.get("nsec")).toBe("genrtd-privatekey");
  });

  it("should get private key hex from device storage", async () => {
    const deviceStorage = new DeviceStoreMock();
    deviceStorage.set("nsec", "stored-private-key-hex");
    renderIndex({ deviceStorage });
    await screen.findByText("Public key: restrd");
  });
});

class ConnectionMock extends Connection {
  _status: ConnectionStatus;
  constructor({ status = "open" }: { status?: ConnectionStatus } = {}) {
    super({ createWebSocket: createWebSocketMock });
    this._status = status;
  }
  handlers = {
    simulateOpen: () => {},
    simulateClose: () => {},
  };
  send = jest.fn();
  onOpen = jest.fn((cb: any) => {
    this.handlers.simulateOpen = cb;
  });
  onMessage = jest.fn();
  onError = jest.fn();
  onClose = jest.fn((cb: any) => {
    this.handlers.simulateClose = cb;
  });
  get status() {
    return this._status;
  }
}

function generateKeyPairMock(): KeyPair {
  return {
    publicKeyHex: "genrtd-pubkey",
    privateKeyHex: "genrtd-privatekey",
  } as KeyPair;
}

function restoreKeyPairMock(): KeyPair {
  return {
    publicKeyHex: "restrd-pubkey",
    privateKeyHex: "restrd-privatekey",
  } as KeyPair;
}

class DeviceStoreMock implements DeviceStotage {
  store = new Map();
  async set(key: string, value: string) {
    this.store.set(key, value);
  }
  async get(key: string) {
    return this.store.get(key);
  }
}
