export const utils = {
  randomPrivateKey: () => new Uint8Array(),
};

export function getPublicKey() {
  return new Uint8Array();
}

export async function signAsync() {
  return { toCompactHex: () => "some-sig" };
}

export const etc = {
  bytesToHex: () => "some-hash",
  hexToBytes: () => new Uint8Array(),
};
