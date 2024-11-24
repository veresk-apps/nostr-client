import { generateKeyPair } from "../key-pair";
jest.mock("@noble/secp256k1");

describe("key-pair", () => {
  it("should generate key pair", async () => {
    const pair = generateKeyPair();
    expect(pair.privateKey).toBeInstanceOf(Uint8Array);
    expect(pair.publicKey).toBeInstanceOf(Uint8Array);
    expect(typeof pair.privateKeyHex).toBe("string");
    expect(typeof pair.publicKeyHex).toBe("string");
  });
});
