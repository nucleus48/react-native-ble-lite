/**
 * A subscription object that allows to conveniently remove an event listener from the emitter.
 */
export interface EventSubscription {
  /**
   * Removes an event listener for which the subscription has been created.
   * After calling this function, the listener will no longer receive any events from the emitter.
   */
  remove(): void;
}

/**
 * Android-specific scan modes for BLE scanning.
 */
export enum ScanMode {
  /**
   * Perform Bluetooth LE scan in low power mode. This is the default scan mode
   * as it consumes the least power.
   */
  LOW_POWER = 0,
  /**
   * Perform Bluetooth LE scan in balanced power mode. Scan results will be
   * delivered at a rate that provides a good trade-off between power
   * consumption and scan latency.
   */
  BALANCED = 1,
  /**
   * Scan using the highest duty cycle. It's recommended to only use this
   * mode when the application is running in the foreground.
   */
  LOW_LATENCY = 2,
  /**
   * A special Bluetooth LE scan mode. Applications using this scan mode will
   * be passively listening for other scan results without starting an
   * active scan themselves.
   */
  OPPORTUNISTIC = -1,
}

/**
 * Android-specific advertising modes for BLE.
 */
export enum AdvertiseMode {
  /**
   * Perform Bluetooth LE advertising in low power mode.
   * Consumes least power but has highest latency.
   */
  LOW_POWER = 0,
  /**
   * Perform Bluetooth LE advertising in balanced power mode.
   */
  BALANCED = 1,
  /**
   * Perform Bluetooth LE advertising in low latency mode and high power consumption.
   */
  LOW_LATENCY = 2,
}

/**
 * Android-specific advertising power levels for BLE.
 */
export enum AdvertisePower {
  /**
   * Advertise using the lowest transmission (TX) power level.
   */
  ULTRA_LOW = 0,
  /**
   * Advertise using low transmission (TX) power level.
   */
  LOW = 1,
  /**
   * Advertise using medium transmission (TX) power level.
   */
  MEDIUM = 2,
  /**
   * Advertise using high transmission (TX) power level.
   */
  HIGH = 3,
}

/**
 * Configuration options for starting a BLE scan.
 */
export interface ScanOptions {
  /**
   * The Service UUID to filter advertisements by.
   */
  serviceUuid: string;
  /**
   * Android-specific scan mode. Higher modes provide faster updates but
   * consume more battery.
   * @default ScanMode.BALANCED
   */
  scanMode?: ScanMode;
  /**
   * iOS-specific option. If true, multiple advertisements from the same
   * device will result in multiple events.
   * @default true
   */
  allowDuplicates?: boolean;
}

/**
 * Configuration options for starting BLE advertising.
 */
export interface AdvertiseOptions {
  /**
   * The Service UUID to advertise.
   */
  serviceUuid: string;
  /**
   * Hex string representation of the service data to include in the
   * advertisement packet.
   */
  data: string;
  /**
   * Android-specific advertising mode.
   * @default AdvertiseMode.LOW_LATENCY
   */
  advertiseMode?: AdvertiseMode;
  /**
   * Android-specific transmission power level.
   * @default AdvertisePower.HIGH
   */
  powerLevel?: AdvertisePower;
  /**
   * Whether the device should be connectable.
   * Note: This module focuses on advertisement only.
   * @default false
   */
  connectable?: boolean;
  /**
   * Whether to include the device name in the advertisement packet.
   * @default false
   */
  includeDeviceName?: boolean;
}

/**
 * Event payload received when a BLE advertisement is detected.
 */
export interface AdvertisementEvent {
  /**
   * The Service UUID found in the advertisement.
   */
  uuid: string;
  /**
   * Hex string representation of the service data associated with the UUID.
   */
  data: string;
  /**
   * Received Signal Strength Indicator (RSSI) in dBm.
   */
  rssi: number;
  /**
   * The unique hardware identifier of the device (MAC address on Android,
   * UUID on iOS).
   */
  deviceId: string;
}

export type ReactNativeBleLiteModuleEvents = {
  /**
   * Event emitted when a BLE advertisement is detected while scanning.
   */
  onAdvertisement: (event: AdvertisementEvent) => void;
};
