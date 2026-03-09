import { NativeModule, requireNativeModule } from "expo";
import {
  AdvertiseOptions,
  ReactNativeBleLiteModuleEvents,
  ScanOptions,
} from "./ReactNativeBleLite.types";

declare class ReactNativeBleLiteModule extends NativeModule<ReactNativeBleLiteModuleEvents> {
  /**
   * Starts advertising with the provided configuration.
   * @param options Configuration for advertising.
   */
  startAdvertising(options: AdvertiseOptions): Promise<void>;

  /**
   * Stops the current advertising session.
   */
  stopAdvertising(): Promise<void>;

  /**
   * Starts scanning for BLE devices with the provided configuration.
   * @param options Configuration for scanning.
   */
  startScanning(options: ScanOptions): Promise<void>;

  /**
   * Stops the current scanning session.
   */
  stopScanning(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeBleLiteModule>(
  "ReactNativeBleLite",
);
