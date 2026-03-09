import ReactNativeBleLiteModule from "./ReactNativeBleLiteModule";
import {
  AdvertisementEvent,
  AdvertiseOptions,
  EventSubscription,
  ScanOptions,
} from "./ReactNativeBleLite.types";

/**
 * Adds a listener for detected BLE advertisements.
 *
 * @example
 * ```ts
 * const subscription = addAdvertisementListener((event) => {
 *   console.log('Detected device:', event.deviceId, 'RSSI:', event.rssi);
 * });
 *
 * // Later
 * subscription.remove();
 * ```
 *
 * @param listener Callback function receiving advertisement events.
 * @returns A subscription object to manage the listener lifecycle.
 */
export function addAdvertisementListener(
  listener: (event: AdvertisementEvent) => void,
): EventSubscription {
  return ReactNativeBleLiteModule.addListener("onAdvertisement", listener);
}

/**
 * Starts scanning for BLE advertisements.
 *
 * @important Ensure that the user has granted necessary Bluetooth and Location permissions
 * before calling this method.
 *
 * @example
 * ```ts
 * await startScanning({
 *   serviceUuid: '12345678-1234-1234-1234-1234567890ab',
 *   scanMode: ScanMode.LOW_LATENCY
 * });
 * ```
 *
 * @param options Configuration for the scanning session.
 * @throws Will throw an error if Bluetooth is unavailable or if the configuration is invalid.
 */
export async function startScanning(options: ScanOptions): Promise<void> {
  return await ReactNativeBleLiteModule.startScanning(options);
}

/**
 * Stops the current BLE scanning session.
 */
export async function stopScanning(): Promise<void> {
  return await ReactNativeBleLiteModule.stopScanning();
}

/**
 * Starts advertising data via BLE.
 *
 * @important Ensure that the user has granted necessary Bluetooth permissions
 * before calling this method.
 *
 * @example
 * ```ts
 * await startAdvertising({
 *   serviceUuid: '12345678-1234-1234-1234-1234567890ab',
 *   data: 'deadbeef',
 *   powerLevel: AdvertisePower.HIGH
 * });
 * ```
 *
 * @param options Configuration for the advertising session.
 * @throws Will throw an error if Bluetooth is unavailable or if advertising is not supported.
 */
export async function startAdvertising(
  options: AdvertiseOptions,
): Promise<void> {
  return await ReactNativeBleLiteModule.startAdvertising(options);
}

/**
 * Stops the current BLE advertising session.
 */
export async function stopAdvertising(): Promise<void> {
  return await ReactNativeBleLiteModule.stopAdvertising();
}

export * from "./ReactNativeBleLite.types";
export { ReactNativeBleLiteModule };
