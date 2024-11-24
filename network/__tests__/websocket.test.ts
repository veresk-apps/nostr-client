import { createWebSocketMock } from "@/utils/test-utils";
import { Connection } from "../websocket";

describe("websocket connection", () => {
  it("should implement connect", () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    expect(connection.ws?.url).toBe("ws://192.168.50.107:8080/");
  });
  it('should register on error handler', () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    const onErrorHanlder = () => {};
    connection.onError(onErrorHanlder);
    expect(connection.ws.onerror).toBe(onErrorHanlder)

    connection.reconnect();
    expect(connection.ws.onerror).toBe(onErrorHanlder)
  });

  it('should register on message callback', () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    const onMessageHandler = () => {};
    connection.onMessage(onMessageHandler);
    expect(connection.ws.onmessage).toBe(onMessageHandler)

    connection.reconnect();
    expect(connection.ws.onmessage).toBe(onMessageHandler)
  });

  it('should register on open callback', () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    const onOpenHandler = () => {};
    connection.onOpen(onOpenHandler);
    expect(connection.ws.onopen).toBe(onOpenHandler)

    connection.reconnect();
    expect(connection.ws.onopen).toBe(onOpenHandler)
  });

  it('should register on close callback', () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    const onCloseHandler = () => {};
    connection.onClose(onCloseHandler);
    expect(connection.ws.onclose).toBe(onCloseHandler)

    connection.reconnect();
    expect(connection.ws.onclose).toBe(onCloseHandler)
  });

  it('should proxy send to ws', () => {
    const connection = new Connection({ createWebSocket: createWebSocketMock });
    connection.ws.send = jest.fn();
    connection.send("foo");
    expect(connection.ws.send).toHaveBeenCalledWith("foo")
  });

});
