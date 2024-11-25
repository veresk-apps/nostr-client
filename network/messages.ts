import { SignedGenericEvent } from "@/utils/events";

export enum MessageType {
  Event = "EVENT"
}

export function createMessage({
  signedEvent,
  type
}: {
  signedEvent: SignedGenericEvent;
  type: MessageType;
}) {
  return JSON.stringify([type, signedEvent])
}
