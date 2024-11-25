import Button from "@/components/Button";
import { Connection, createWebSocket } from "@/network/websocket";
import * as keyPair from "@/utils/key-pair";
import { KeyPair } from "@/utils/key-pair";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import * as keyStore from "@/utils/key-store";
import { createGenericEvent, EventKind, signEvent } from "@/utils/events";
import { createMessage, MessageType } from "@/network/messages";

interface Props {
  createConnection?: () => Connection;
  generateKeyPair?: () => KeyPair;
  restoreKeyPair?: (privateKeyHex: string) => KeyPair;
  createDeviceStore?: () => keyStore.DeviceStotage;
}

export default function Index({
  createConnection = () => new Connection({ createWebSocket }),
  generateKeyPair = keyPair.generateKeyPair,
  restoreKeyPair = keyPair.restoreKeyPair,
  createDeviceStore = keyStore.createDeviceStore,
}: Props) {
  const [connection] = useState(createConnection);
  const [deviceStore] = useState(createDeviceStore);

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
    setupKeyPair()
      .then(() => {
        // somehow android opens connection before onOpen callback is registered
        setConnected(connection.status == "open");
      })
      .catch(console.error);

    connection.onOpen(() => {
      setConnected(true);
    });

    connection.onMessage((event) => {
      console.log("[MESSAGE]", event.data);
    });

    connection.onError((event) => {
      console.log("[ERROR]", JSON.stringify(event, null, 2));
    });

    connection.onClose(() => {
      setConnected(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Public key: {keyPair?.publicKeyHex.slice(0, 6) ?? "......"}</Text>
        {connected ? <Text>Connected</Text> : <Text>Disconnected</Text>}
      </View>
      <View style={styles.main}>
        <Button
          label="Send"
          onPress={() =>
            keyPair && buildMessage({
              content: "hello, world from " + Platform.OS,
              keyPair,
            }).then(message => connection.send(message))
          }
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

async function buildMessage({
  keyPair,
  content,
}: {
  keyPair: KeyPair;
  content: string;
}) {
  const event = createGenericEvent({
    kind: EventKind.TextNote,
    pubkey: keyPair.publicKeyHex,
    content,
  });
  const signedEvent = await signEvent({
    event,
    privateKey: keyPair.privateKey,
  });
  const eventMessage = createMessage({
    signedEvent,
    type: MessageType.Event,
  });
  return eventMessage;
}