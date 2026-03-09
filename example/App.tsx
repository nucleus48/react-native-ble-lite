import { useEvent } from "expo";
import ReactNativeBleLite from "react-native-ble-lite";
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
} from "react-native";
import { useState } from "react";

const DEFAULT_SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const DEFAULT_DATA = "deadbeef";

export default function App() {
  const [uuid, setUuid] = useState(DEFAULT_SERVICE_UUID);
  const [data, setData] = useState(DEFAULT_DATA);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);

  const lastAdvertisement = useEvent(ReactNativeBleLite, "onAdvertisement");

  const startScanning = async () => {
    try {
      await ReactNativeBleLite.startScanning(uuid);
      setIsScanning(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopScanning = async () => {
    try {
      await ReactNativeBleLite.stopScanning();
      setIsScanning(false);
    } catch (e) {
      console.error(e);
    }
  };

  const startAdvertising = async () => {
    try {
      await ReactNativeBleLite.startAdvertising(uuid, data);
      setIsAdvertising(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopAdvertising = async () => {
    try {
      await ReactNativeBleLite.stopAdvertising();
      setIsAdvertising(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>BLE Lite</Text>

        <Group name="Configuration">
          <Text style={styles.label}>Service UUID:</Text>
          <TextInput
            style={styles.input}
            value={uuid}
            onChangeText={setUuid}
            placeholder="UUID"
          />
          <Text style={styles.label}>Service Data (Hex):</Text>
          <TextInput
            style={styles.input}
            value={data}
            onChangeText={setData}
            placeholder="Hex Data"
          />
        </Group>

        <Group name="Actions">
          <View style={styles.buttonRow}>
            <Button
              title={isScanning ? "Stop Scanning" : "Start Scanning"}
              onPress={isScanning ? stopScanning : startScanning}
              color={isScanning ? "red" : "blue"}
            />
            <Button
              title={isAdvertising ? "Stop Advertising" : "Start Advertising"}
              onPress={isAdvertising ? stopAdvertising : startAdvertising}
              color={isAdvertising ? "red" : "blue"}
            />
          </View>
        </Group>

        <Group name="Last Advertisement Seen">
          {lastAdvertisement ? (
            <View>
              <Text>
                <Text style={styles.bold}>Device ID:</Text>{" "}
                {lastAdvertisement.deviceId}
              </Text>
              <Text>
                <Text style={styles.bold}>RSSI:</Text> {lastAdvertisement.rssi}
              </Text>
              <Text>
                <Text style={styles.bold}>Data:</Text>{" "}
                {lastAdvertisement.data || "(None)"}
              </Text>
            </View>
          ) : (
            <Text>No advertisements seen yet.</Text>
          )}
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  group: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bold: {
    fontWeight: "bold",
  },
});
