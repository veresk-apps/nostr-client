import Button from "@/components/Button";
import { Connection, createWebSocket } from "@/network/websocket";
import {
  KeyPair,
  generateKeyPair as generateKeyPairUtil,
} from "@/utils/key-pair";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";

interface Props {
  connection?: Connection;
  generateKeyPair?: () => KeyPair;
}

export default function Index({
  connection = new Connection({ createWebSocket }),
  generateKeyPair = generateKeyPairUtil,
}: Props) {
  const [connected, setConnected] = useState(false);
  const [keyPair] = useState(generateKeyPair());
  useEffect(() => {
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
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});