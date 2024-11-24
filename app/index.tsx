import Button from "@/components/Button";
import { Connection, createWebSocket } from "@/network/websocket";
import { useEffect, useState } from "react";
import { Text, View, Platform } from "react-native";

interface Props {
  connection?: Connection;
}

export default function Index({
  connection = new Connection({ createWebSocket }),
}: Props) {
  const [connected, setConnected] = useState(false);
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {connected ? <Text>Connected</Text> : <Text>Disconnected</Text>}
      <Button label="Send" onPress={() => connection.send("hello, world from " + Platform.OS)} />
    </View>
  );
}
