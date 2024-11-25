import {
  createGenericEvent,
  EventKind,
  serializeEvent,
  signEvent,
} from "../events";

describe("events", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 1732544770999);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("createGenericEvent", () => {
    it("it should have unsigned text note fields", () => {
      const event = createGenericEvent({
        kind: EventKind.TextNote,
        pubkey: "pubkey",
        content: "hello, world",
      });

      expect(event.pubkey).toBe("pubkey");
      expect(event.created_at).toBe(1732544770);
      expect(event.kind).toBe(EventKind.TextNote);
      expect(event.tags).toEqual([]);
      expect(event.content).toBe("hello, world");
    });
  });
  describe("serialize event", () => {
    it("should serialize generic event", () => {
      const event = createGenericEvent({
        kind: EventKind.TextNote,
        pubkey: "pubkey",
        content: "hello, world",
      });
      const serialized = serializeEvent(event);
      expect(serialized).toBe('[0,"pubkey",1732544770,1,[],"hello, world"]');
    });
  });
  describe("sign event", () => {
    it("should sing the event", async () => {
      const event = createGenericEvent({
        kind: EventKind.TextNote,
        pubkey: "pubkey",
        content: "hello, world",
      });
      const signedEvent = await signEvent({
        event,
        privateKey: new Uint8Array(),
      });

      expect(signedEvent.pubkey).toBe("pubkey");
      expect(signedEvent.created_at).toBe(1732544770);
      expect(signedEvent.kind).toBe(EventKind.TextNote);
      expect(signedEvent.tags).toEqual([]);
      expect(signedEvent.content).toBe("hello, world");

      expect(signedEvent.id).toBe("some-hash");
      expect(signedEvent.sig).toBe("some-sig");
    });
  });
});
