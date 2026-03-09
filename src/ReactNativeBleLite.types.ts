export interface EventSubscription {
  remove(): void;
}

export interface AdvertisementEvent {
  uuid: string;
  data: string;
  rssi: number;
  deviceId: string;
}

export type ReactNativeBleLiteModuleEvents = {
  onAdvertisement: (event: AdvertisementEvent) => void;
};
