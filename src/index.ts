import {
  AdvertisementEvent,
  EventSubscription,
} from "./ReactNativeBleLite.types";
import ReactNativeBleLiteModule from "./ReactNativeBleLiteModule";

export function addAdvertisementListener(
  listener: (event: AdvertisementEvent) => void,
): EventSubscription {
  return ReactNativeBleLiteModule.addListener("onAdvertisement", listener);
}

export async function startScanning(serviceUuid: string): Promise<void> {
  return await ReactNativeBleLiteModule.startScanning(serviceUuid);
}

export async function stopScanning(): Promise<void> {
  return await ReactNativeBleLiteModule.stopScanning();
}

export async function startAdvertising(
  serviceUuid: string,
  data: string,
): Promise<void> {
  return await ReactNativeBleLiteModule.startAdvertising(serviceUuid, data);
}

export async function stopAdvertising(): Promise<void> {
  return await ReactNativeBleLiteModule.stopAdvertising();
}

export * from "./ReactNativeBleLite.types";
