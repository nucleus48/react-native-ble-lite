import { NativeModule, requireNativeModule } from "expo";
import { ReactNativeBleLiteModuleEvents } from "./ReactNativeBleLite.types";

declare class ReactNativeBleLiteModule extends NativeModule<ReactNativeBleLiteModuleEvents> {
  startAdvertising(serviceUuid: string, data: string): Promise<void>;
  stopAdvertising(): Promise<void>;
  startScanning(serviceUuid: string): Promise<void>;
  stopScanning(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeBleLiteModule>(
  "ReactNativeBleLite",
);
