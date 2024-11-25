import Button from "@/components/Button";
import { Connection, createWebSocket } from "@/network/websocket";
import * as keyPairUtils from "@/utils/key-pair";
import { KeyPair } from "@/utils/key-pair";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { DeviceStotage, MobileStorage, WebStorage } from "@/utils/key-store";

interface Props {
  connection?: Connection;
  generateKeyPair?: () => KeyPair;
  restoreKeyPair?: (privateKeyHex: string) => KeyPair;
  deviceStore?: DeviceStotage;
}

export default function Index({
  connection = new Connection({ createWebSocket }),
  generateKeyPair = keyPairUtils.generateKeyPair,
  restoreKeyPair = keyPairUtils.restoreKeyPair,
  deviceStore = Platform.OS == "web" ? new WebStorage() : new MobileStorage(),
}: Props) {
  const [connected, setConnected] = useState(false);
  const [keyPair, setKeyPair] = useState<KeyPair | null>(generateKeyPair());

  async function setupKeyPair() {
    const storedPrivateKey = await deviceStore.get("nsec");
    if (storedPrivateKey) {
      setKeyPair(restoreKeyPair(storedPrivateKey));
    } else {
      const keyPair = generateKeyPair();
      setKeyPair(keyPair);
      await deviceStore.set("nsec", keyPair.privateKeyHex);
    }
  }

  useEffect(() => {
    setupKeyPair().catch(console.error);

    connection.onOpen(() => {
      console.log("ON OPEN");
      setConnected(true);
    });

    connection.onMessage((event) => {
      console.log("[MESSAGE]", event.data);
    });

    connection.onError((event) => {
      console.log("[ERROR]", JSON.stringify(event, null, 2));
    });

    connection.onClose(() => {
      console.log("ON CLOSE");
      setConnected(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Public key: {keyPair.publicKeyHex.slice(0, 6)}</Text>
        {connected ? <Text>Connected</Text> : <Text>Disconnected</Text>}
      </View>
      <View style={styles.main}>
        <Button
          label="Send"
          onPress={() => connection.send("hello, world from " + Platform.OS)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 10,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
