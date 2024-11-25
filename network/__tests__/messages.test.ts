import { SignedGenericEvent } from "@/utils/events";
import { createMessage, MessageType } from "../messages";

describe("messages", () => {
  describe("createMessage", () => {
    it("should form event message", () => {
      const signedEvent = {
        content: "foo",
      } as SignedGenericEvent;
      const eventMessage = createMessage({
        signedEvent,
        type: MessageType.Event,
      });
      expect(eventMessage).toBe('["EVENT",{"content":"foo"}]');
    });
  });
});
