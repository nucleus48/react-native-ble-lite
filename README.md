# react-native-ble-lite

[![npm version](https://img.shields.io/npm/v/react-native-ble-lite.svg?style=flat-square)](https://www.npmjs.com/package/react-native-ble-lite)
[![npm downloads](https://img.shields.io/npm/dm/react-native-ble-lite.svg?style=flat-square)](https://www.npmjs.com/package/react-native-ble-lite)
[![license](https://img.shields.io/npm/l/react-native-ble-lite.svg?style=flat-square)](https://github.com/nucleus48/react-native-ble-lite/blob/main/LICENSE)
[![platform](https://img.shields.io/badge/platforms-android%20|%20ios%20|%20expo-lightgrey.svg?style=flat-square)](https://github.com/nucleus48/react-native-ble-lite)

A lightweight, high-performance Bluetooth Low Energy (BLE) library for React Native and Expo. Focused on core **Central (Scanning)** and **Peripheral (Advertising)** capabilities with a clean, strongly-typed API.

Built using the [Expo Module API](https://docs.expo.dev/modules/overview/) for maximum performance and stability.

## Features

- 🛰️ **Central Mode**: Scan for specific BLE devices filtering by Service UUID.
- 📢 **Peripheral Mode**: Advertise custom data with flexible power settings.
- ⚡ **Expo Ready**: Works seamlessly with Expo and React Native CLI.
- 🚀 **Performant**: Native implementation in Swift (iOS) and Kotlin (Android).
- 🏷️ **Strongly Typed**: Comprehensive TypeScript definitions for all modes and options.
- 🔋 **Power Efficient**: Fine-grained control over scan and advertising modes.

---

## Installation

```bash
# Using npm
npm install react-native-ble-lite

# Using pnpm
pnpm add react-native-ble-lite

# Using yarn
yarn add react-native-ble-lite
```

_Note: This package requires `expo-modules` to be installed in your project._

---

## Expo Config Plugin

For Expo developers using [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/), this library includes a config plugin to automatically configure native projects.

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-ble-lite",
        {
          "bluetoothAlwaysPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices",
          "bluetoothPeripheralPermission": "Allow $(PRODUCT_NAME) to discover and connect to bluetooth devices"
        }
      ]
    ]
  }
}
```

### Config Plugin Options

| Property                        | Type     | Default                                                                | Description                                           |
| :------------------------------ | :------- | :--------------------------------------------------------------------- | :---------------------------------------------------- |
| `bluetoothAlwaysPermission`     | `string` | `"Allow $(PRODUCT_NAME) to connect to bluetooth devices"`              | iOS: `NSBluetoothAlwaysUsageDescription` message.     |
| `bluetoothPeripheralPermission` | `string` | `"Allow $(PRODUCT_NAME) to discover and connect to bluetooth devices"` | iOS: `NSBluetoothPeripheralUsageDescription` message. |

---

## Platform Setup

### iOS

If you are **not** using the Expo Config Plugin, add the following keys to your `Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to find and communicate with nearby devices.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth to advertise its presence to other devices.</string>
```

### Android

The library automatically adds the required permissions to your `AndroidManifest.xml` via manifest merger. No manual steps are required for standard projects. The permissions included are:

- `android.permission.BLUETOOTH`
- `android.permission.BLUETOOTH_ADMIN`
- `android.permission.BLUETOOTH_SCAN`
- `android.permission.BLUETOOTH_ADVERTISE`
- `android.permission.BLUETOOTH_CONNECT`
- `android.permission.ACCESS_FINE_LOCATION` (Required for scanning on some Android versions)

---

## Usage

### 1. Central Mode (Scanning)

Listen for nearby devices advertising a specific Service UUID.

```tsx
import * as BLE from "react-native-ble-lite";
import { useEffect } from "react";

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";

export default function App() {
  useEffect(() => {
    // 1. Subscribe to events
    const subscription = BLE.addAdvertisementListener((event) => {
      console.log("Found Device:", event.deviceId);
      console.log("RSSI:", event.rssi);
      console.log("Service Data (Hex):", event.data);
    });

    // 2. Start scanning
    const startScan = async () => {
      try {
        await BLE.startScanning({
          serviceUuid: SERVICE_UUID,
          scanMode: BLE.ScanMode.LOW_LATENCY,
          allowDuplicates: false, // iOS only
        });
      } catch (err) {
        console.error("Scan failed to start", err);
      }
    };

    startScan();

    return () => {
      subscription.remove();
      BLE.stopScanning();
    };
  }, []);

  return null;
}
```

### 1b. Using Expo `useEvent` hook (Recommended for Expo apps)

If you are using Expo, you can use the built-in `useEvent` hook for a more reactive approach:

```tsx
import { useEvent } from "expo";
import * as BLE from "react-native-ble-lite";

function MyComponent() {
  const lastAdvertisement = useEvent(
    BLE.ReactNativeBleLiteModule,
    "onAdvertisement",
  );

  return (
    <View>
      <Text>Last seen device: {lastAdvertisement?.deviceId}</Text>
    </View>
  );
}
```

### 2. Peripheral Mode (Advertising)

Advertise your own service and data so other devices can find you.

```tsx
import * as BLE from "react-native-ble-lite";

const startAd = async () => {
  try {
    await BLE.startAdvertising({
      serviceUuid: "12345678-1234-1234-1234-1234567890ab",
      data: "deadbeef", // Hex string data
      powerLevel: BLE.AdvertisePower.HIGH,
      advertiseMode: BLE.AdvertiseMode.LOW_LATENCY,
      includeDeviceName: true,
    });
    console.log("Advertising started!");
  } catch (err) {
    console.error("Advertising failed", err);
  }
};

const stopAd = () => {
  BLE.stopAdvertising();
};
```

---

## API Reference

### Methods

#### `startScanning(options: ScanOptions): Promise<void>`

Starts looking for BLE advertisements. Filters results by the provided `serviceUuid`.

#### `stopScanning(): Promise<void>`

Stops the current scan session.

#### `startAdvertising(options: AdvertiseOptions): Promise<void>`

Begins broadcasting a BLE advertisement packet containing the Service UUID and hexadecimal data.

#### `stopAdvertising(): Promise<void>`

Stops the current advertising session.

#### `addAdvertisementListener(listener: (event: AdvertisementEvent) => void): EventSubscription`

Adds a global listener for detected advertisements. Returns a subscription object to remove the listener later.

---

### Types & Enums

#### `ScanOptions`

| Property          | Type       | Default      | Description                                    |
| :---------------- | :--------- | :----------- | :--------------------------------------------- |
| `serviceUuid`     | `string`   | **Required** | The UUID to filter by.                         |
| `scanMode`        | `ScanMode` | `BALANCED`   | Android power/latency preset.                  |
| `allowDuplicates` | `boolean`  | `true`       | (iOS) Receive multiple events for same device. |

#### `ScanMode` (Android)

- `LOW_POWER`: Consumes minimum battery.
- `BALANCED`: Standard trade-off.
- `LOW_LATENCY`: Highest frequency updates.
- `OPPORTUNISTIC`: Passive listening.

#### `AdvertiseOptions`

| Property            | Type             | Default       | Description                        |
| :------------------ | :--------------- | :------------ | :--------------------------------- |
| `serviceUuid`       | `string`         | **Required**  | The UUID to advertise.             |
| `data`              | `string`         | `""`          | Hex string of service data.        |
| `advertiseMode`     | `AdvertiseMode`  | `LOW_LATENCY` | Advertising interval preset.       |
| `powerLevel`        | `AdvertisePower` | `HIGH`        | Transmission power strength.       |
| `includeDeviceName` | `boolean`        | `false`       | Include local name in packet.      |
| `connectable`       | `boolean`        | `false`       | Whether the device is connectable. |

#### `AdvertisementEvent`

| Property   | Type     | Description                                      |
| :--------- | :------- | :----------------------------------------------- |
| `uuid`     | `string` | The Service UUID found.                          |
| `data`     | `string` | The Hex data associated with the UUID.           |
| `rssi`     | `number` | Signal strength in dBm.                          |
| `deviceId` | `string` | Unique identifier (MAC on Android, UUID on iOS). |

---

## Important Notes

- **Permissions**: You must handle runtime permission requests (`BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `ACCESS_FINE_LOCATION`) in your application code using libraries like `expo-location` or `react-native-permissions` before calling the methods.
- **Data Limits**: BLE advertisement packets are limited (usually 31 bytes total). If your data is too long, advertising may fail or be truncated depending on the platform.
- **Service Data**: This library specifically handles **Service Data** associated with a Service UUID. It does not currently handle Manufacturer Data or other custom fields.

## License

ISC
