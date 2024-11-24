import * as secp from "@noble/secp256k1";
import 'react-native-get-random-values';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
secp.etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, secp.etc.concatBytes(...m));
secp.etc.hmacSha256Async = (k, ...m) => Promise.resolve(secp.etc.hmacSha256Sync!(k, ...m));

export function generateKeyPair() {
  const privateKey = secp.utils.randomPrivateKey();
  return new KeyPair({ privateKey });
}

export class KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  privateKeyHex: string;
  publicKeyHex: string;
  constructor({ privateKey }: { privateKey: Uint8Array }) {
    this.privateKey = privateKey;
    this.publicKey = secp.getPublicKey(privateKey);
    this.privateKeyHex = secp.etc.bytesToHex(this.privateKey);
    this.publicKeyHex = secp.etc.bytesToHex(this.publicKey);
  }
}
