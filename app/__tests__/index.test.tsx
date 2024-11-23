import { render, screen, userEvent } from "@testing-library/react-native";
import Index from "../index";
import { Connection } from "@/network/websocket";
import { createWebSocketMock } from "@/utils/test-utils";
import { act } from "react";

function renderIndex() {
  const connection = new ConnectionMock();
  render(<Index connection={connection} />);
  return { connection };
}

describe("Index", () => {
  it("should render 'Connected' after connection is open", async () => {
    const { connection } = renderIndex();
    screen.getByText("Disconnected");
    act(() => {
      connection.handlers.simulateOpen()
    });
    screen.getByText("Connected")
  });

  it("should render 'Disconnected' after connection closes", async () => {
    const { connection } = renderIndex();
    act(() => {
      connection.handlers.simulateOpen()
    });
    screen.getByText("Connected");
    act(() => {
      connection.handlers.simulateClose();
    });
    screen.getByText("Disconnected");
  });

  it("should call connection handlers", async () => {
    const { connection } = renderIndex();
    expect(connection.onOpen).toHaveBeenCalled();
    expect(connection.onMessage).toHaveBeenCalled();
    expect(connection.onError).toHaveBeenCalled();
    expect(connection.onClose).toHaveBeenCalled();
  });

  it("should call connection.send on send button click", async () => {
    const { connection } = renderIndex();
    await userEvent.press(screen.getByText("Send"));
    expect(connection.send).toHaveBeenCalledWith("hello, world");
  });

  
});

class ConnectionMock extends Connection {
  constructor() {
    super({ createWebSocket: createWebSocketMock });
  }
  handlers = {
    simulateOpen: () => {},
    simulateClose: () => {}
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
