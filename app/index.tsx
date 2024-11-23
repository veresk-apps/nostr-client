import Button from "@/components/Button";
import { Connection, createWebSocket } from "@/network/websocket";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface Props {
  connection?: Connection;
}

export default function Index({
  connection = new Connection({ createWebSocket }),
}: Props) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    connection.onOpen(() => {
      setConnected(true);
    });

    connection.onMessage((event) => {
      console.log("[MESSAGE]", event);
    });

    connection.onError((event) => {
      console.log("[ERROR]", event);
    });

    connection.onClose(() => {
      setConnected(false);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {connected ? <Text>Connected</Text> : <Text>Disconnected</Text>}
      <Button label="Send" onPress={() => connection.send("hello, world")} />
    </View>
  );
}
