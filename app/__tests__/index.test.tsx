import { render, screen, userEvent } from "@testing-library/react-native";
import Index from "../index";
import { Connection } from "@/network/websocket";
import { createWebSocketMock } from "@/utils/test-utils";
import { act } from "react";
import { KeyPair } from "@/utils/key-pair";
import { DeviceStotage } from "@/utils/key-store";

function renderIndex({
  generateKeyPair = generateKeyPairMock,
  restoreKeyPair = restoreKeyPairMock,
  deviceStorage = new DeviceStoreMock(),
}: {
  generateKeyPair?: () => KeyPair;
  restoreKeyPair?: () => KeyPair;
  deviceStorage?: DeviceStotage;
} = {}) {
  const connection = new ConnectionMock();
  render(
    <Index
      connection={connection}
      generateKeyPair={generateKeyPair}
      restoreKeyPair={restoreKeyPair}
      deviceStore={deviceStorage}
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

  it("should render 'Connected' after connection is open", async () => {
    const { connection } = renderIndex();
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
    await screen.findByText("Public key: genrtd")
    expect(connection.onOpen).toHaveBeenCalled();
    expect(connection.onMessage).toHaveBeenCalled();
    expect(connection.onError).toHaveBeenCalled();
    expect(connection.onClose).toHaveBeenCalled();
  });

  it("should call connection.send on send button click", async () => {
    const { connection } = renderIndex();
    await screen.findByText("Public key: genrtd")
    await userEvent.press(screen.getByText("Send"));
    expect(connection.send).toHaveBeenCalledWith("hello, world from ios");
  });

  it("should display public key", async () => {
    renderIndex();
    await screen.findByText("Public key: genrtd")
  });

  it("should save generated private key hex in device storage", async () => {
    const { deviceStorage } = renderIndex();
    await screen.findByText("Public key: genrtd")
    expect(await deviceStorage.get("nsec")).toBe("genrtd-privatekey");
  });

  it("should get private key hex from device storage", async () => {
    const deviceStorage = new DeviceStoreMock();
    deviceStorage.set("nsec", "stored-private-key-hex");
    renderIndex({ deviceStorage });
    await screen.findByText("Public key: restrd")
  });
});

class ConnectionMock extends Connection {
  constructor() {
    super({ createWebSocket: createWebSocketMock });
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
