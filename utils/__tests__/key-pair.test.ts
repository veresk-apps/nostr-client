import { generateKeyPair, KeyPair, restoreKeyPair } from "../key-pair";

describe("key-pair", () => {
  it("should generate key pair", () => {
    const pair = generateKeyPair();
    expect(pair).toBeInstanceOf(KeyPair);
  });

  it('should restore key pair from private key hex', () => {
    const pair = restoreKeyPair("f00");
    expect(pair).toBeInstanceOf(KeyPair);
  })
});
