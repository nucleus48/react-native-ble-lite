import { useEvent } from "expo";
import * as BLE from "react-native-ble-lite";
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  Switch,
} from "react-native";
import { useState } from "react";

const DEFAULT_SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const DEFAULT_DATA = "deadbeef";

export default function App() {
  const [uuid, setUuid] = useState(DEFAULT_SERVICE_UUID);
  const [data, setData] = useState(DEFAULT_DATA);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(true);

  // Use the module object directly for events or use the convenience exports
  const lastAdvertisement = useEvent(
    BLE.ReactNativeBleLiteModule,
    "onAdvertisement",
  );

  const handleStartScanning = async () => {
    try {
      await BLE.startScanning({
        serviceUuid: uuid,
        scanMode: BLE.ScanMode.LOW_LATENCY,
        allowDuplicates: allowDuplicates,
      });
      setIsScanning(true);
    } catch (e: any) {
      console.error("Scan Error:", e.message);
      alert(`Scan failed: ${e.message}`);
    }
  };

  const handleStopScanning = async () => {
    try {
      await BLE.stopScanning();
      setIsScanning(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleStartAdvertising = async () => {
    try {
      await BLE.startAdvertising({
        serviceUuid: uuid,
        data: data,
        powerLevel: BLE.AdvertisePower.HIGH,
        advertiseMode: BLE.AdvertiseMode.LOW_LATENCY,
      });
      setIsAdvertising(true);
    } catch (e: any) {
      console.error("Advertise Error:", e.message);
      alert(`Advertising failed: ${e.message}`);
    }
  };

  const handleStopAdvertising = async () => {
    try {
      await BLE.stopAdvertising();
      setIsAdvertising(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>BLE Lite Configurable</Text>

        <Group name="Configuration">
          <Text style={styles.label}>Service UUID:</Text>
          <TextInput
            style={styles.input}
            value={uuid}
            onChangeText={setUuid}
            placeholder="UUID (e.g. 1234...)"
          />
          <Text style={styles.label}>Service Data (Hex):</Text>
          <TextInput
            style={styles.input}
            value={data}
            onChangeText={setData}
            placeholder="Hex Data (e.g. deadbeef)"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Allow Duplicates (iOS):</Text>
            <Switch
              value={allowDuplicates}
              onValueChange={setAllowDuplicates}
            />
          </View>
        </Group>

        <Group name="Actions">
          <View style={styles.buttonCol}>
            <View style={styles.buttonSpacing}>
              <Button
                title={
                  isScanning ? "Stop Scanning" : "Start Scanning (Low Latency)"
                }
                onPress={isScanning ? handleStopScanning : handleStartScanning}
                color={isScanning ? "#ff4444" : "#2196F3"}
              />
            </View>
            <View style={styles.buttonSpacing}>
              <Button
                title={
                  isAdvertising
                    ? "Stop Advertising"
                    : "Start Advertising (High Power)"
                }
                onPress={
                  isAdvertising ? handleStopAdvertising : handleStartAdvertising
                }
                color={isAdvertising ? "#ff4444" : "#4CAF50"}
              />
            </View>
          </View>
        </Group>

        <Group name="Live Feed">
          {lastAdvertisement ? (
            <View style={styles.eventContainer}>
              <Text style={styles.dataPoint}>
                <Text style={styles.bold}>Device ID:</Text>{" "}
                {lastAdvertisement.deviceId}
              </Text>
              <Text style={styles.dataPoint}>
                <Text style={styles.bold}>RSSI:</Text> {lastAdvertisement.rssi}{" "}
                dBm
              </Text>
              <Text style={styles.dataPoint}>
                <Text style={styles.bold}>Data:</Text>{" "}
                {lastAdvertisement.data || "(None)"}
              </Text>
              <Text style={styles.timestamp}>
                Last seen: {new Date().toLocaleTimeString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>No advertisements detected.</Text>
          )}
        </Group>

        <Text style={styles.footer}>
          Note: Ensure Bluetooth permissions are granted in the host app.
        </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 30,
    marginHorizontal: 20,
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  group: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#333",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  buttonCol: {
    flexDirection: "column",
  },
  buttonSpacing: {
    marginVertical: 6,
  },
  eventContainer: {
    backgroundColor: "#fff4e5",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ffa94d",
  },
  dataPoint: {
    fontSize: 15,
    marginBottom: 4,
    color: "#444",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  placeholder: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
  bold: {
    fontWeight: "700",
    color: "#111",
  },
  footer: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 40,
  },
});
