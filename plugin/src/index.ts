import {
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  AndroidConfig,
} from "@expo/config-plugins";

/**
 * A config plugin for react-native-ble-lite that ensures the necessary
 * Bluetooth permissions and features are added to the native projects.
 */
const withBleLite: ConfigPlugin<
  {
    bluetoothAlwaysPermission?: string;
    bluetoothPeripheralPermission?: string;
  } | void
> = (config, props) => {
  const {
    bluetoothAlwaysPermission = "Allow $(PRODUCT_NAME) to connect to bluetooth devices",
    bluetoothPeripheralPermission = "Allow $(PRODUCT_NAME) to discover and connect to bluetooth devices",
  } = props || {};

  // iOS: Add permission strings to Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.NSBluetoothAlwaysUsageDescription =
      bluetoothAlwaysPermission;
    config.modResults.NSBluetoothPeripheralUsageDescription =
      bluetoothPeripheralPermission;
    return config;
  });

  // Android: Permissions are already in the library's AndroidManifest.xml,
  // but we can ensure they are properly merged or add additional ones if needed.
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Ensure Bluetooth permissions are present
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.BLUETOOTH",
    );
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.BLUETOOTH_ADMIN",
    );
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.BLUETOOTH_SCAN",
    );
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.BLUETOOTH_ADVERTISE",
    );
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.BLUETOOTH_CONNECT",
    );
    AndroidConfig.Permissions.addPermission(
      androidManifest,
      "android.permission.ACCESS_FINE_LOCATION",
    );

    return config;
  });

  return config;
};

export default withBleLite;
