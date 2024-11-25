import { nowUnix } from "./time";
import * as secp from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

export enum EventKind {
  TextNote = 1,
}

interface GenericEvent {
  pubkey: string;
  created_at: number;
  kind: EventKind.TextNote;
  tags: Array<Array<string>>;
  content: string;
}

export function createGenericEvent({
  kind,
  pubkey,
  content,
}: {
  kind: EventKind;
  pubkey: string;
  content: string;
}): GenericEvent {
  return {
    pubkey,
    created_at: nowUnix(),
    kind,
    tags: [],
    content,
  };
}

export type SignedGenericEvent = GenericEvent & { id: string; sig: string };

export async function signEvent({
  event,
  privateKey
}: {
  event: GenericEvent;
  privateKey: Uint8Array;
}): Promise<SignedGenericEvent> {
  const serialised = serializeEvent(event);
  const hash = secp.etc.bytesToHex(sha256(serialised));
  return {
    ...event,
    id: hash,
    sig: (await secp.signAsync(hash, privateKey)).toCompactHex(),
  };
}

export function serializeEvent(event: GenericEvent) {
  return JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content,
  ]);
}
