import ExpoModulesCore
import CoreBluetooth

enum ScanMode: Int, Enumerable {
  case lowPower = 0
  case balanced = 1
  case lowLatency = 2
  case opportunistic = -1
}

enum AdvertiseMode: Int, Enumerable {
  case lowPower = 0
  case balanced = 1
  case lowLatency = 2
}

enum AdvertisePower: Int, Enumerable {
  case ultraLow = 0
  case low = 1
  case medium = 2
  case high = 3
}

struct ScanOptions: Record {
  @Field var serviceUuid: String = ""
  @Field var scanMode: ScanMode = .balanced
  @Field var allowDuplicates: Bool = true
}

struct AdvertiseOptions: Record {
  @Field var serviceUuid: String = ""
  @Field var data: String = ""
  @Field var advertiseMode: AdvertiseMode = .lowLatency
  @Field var powerLevel: AdvertisePower = .high
  @Field var connectable: Bool = false
  @Field var includeDeviceName: Bool = false
}

public class ReactNativeBleLiteModule: Module, CBCentralManagerDelegate, CBPeripheralManagerDelegate {
  private var centralManager: CBCentralManager?
  private var peripheralManager: CBPeripheralManager?
  
  private var scanningOptions: ScanOptions?
  private var advertisingOptions: AdvertiseOptions?

  public func definition() -> ModuleDefinition {
    Name("ReactNativeBleLite")

    Events("onAdvertisement")

    AsyncFunction("startScanning") { (options: ScanOptions) in
      self.scanningOptions = options
      let uuid = CBUUID(string: options.serviceUuid)
      
      if centralManager == nil {
        centralManager = CBCentralManager(delegate: self, queue: nil)
      }
      
      if centralManager?.state == .poweredOn {
        centralManager?.scanForPeripherals(
          withServices: [uuid],
          options: [CBCentralManagerScanOptionAllowDuplicatesKey: options.allowDuplicates]
        )
      }
    }

    AsyncFunction("stopScanning") {
      centralManager?.stopScan()
      scanningOptions = nil
    }

    AsyncFunction("startAdvertising") { (options: AdvertiseOptions) in
      self.advertisingOptions = options
      
      if peripheralManager == nil {
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
      }
      
      if peripheralManager?.state == .poweredOn {
        startAdvertisingInternal()
      }
    }

    AsyncFunction("stopAdvertising") {
      peripheralManager?.stopAdvertising()
      advertisingOptions = nil
    }
  }

  // MARK: - CBCentralManagerDelegate

  public func centralManagerDidUpdateState(_ central: CBCentralManager) {
    if central.state == .poweredOn, let options = scanningOptions {
      let uuid = CBUUID(string: options.serviceUuid)
      central.scanForPeripherals(
        withServices: [uuid],
        options: [CBCentralManagerScanOptionAllowDuplicatesKey: options.allowDuplicates]
      )
    }
  }

  public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    guard let options = scanningOptions else { return }
    let uuid = CBUUID(string: options.serviceUuid)
    
    // Check for service data
    let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data]
    let data = serviceData?[uuid]
    
    sendEvent("onAdvertisement", [
      "uuid": options.serviceUuid,
      "data": data?.toHexString() ?? "",
      "rssi": RSSI,
      "deviceId": peripheral.identifier.uuidString
    ])
  }

  // MARK: - CBPeripheralManagerDelegate

  public func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
    if peripheral.state == .poweredOn {
      startAdvertisingInternal()
    }
  }

  private func startAdvertisingInternal() {
    guard let options = advertisingOptions else { return }
    let uuid = CBUUID(string: options.serviceUuid)
    
    // Note: iOS peripheral mode in background/local-only has limitations on Service Data.
    // We advertise the Service UUID. Device name is handled by the OS settings mostly.
    var advertisement: [String: Any] = [
      CBAdvertisementDataServiceUUIDsKey: [uuid]
    ]
    
    if options.includeDeviceName {
       // On iOS, the Local Name might not be allowed in all scenarios via startAdvertising,
       // but we'll try to include it if possible/relevant.
       // advertisement[CBAdvertisementDataLocalNameKey] = "..."
    }

    peripheralManager?.startAdvertising(advertisement)
  }
}

extension String {
  func toData() -> Data? {
    if self.isEmpty { return Data() }
    var data = Data(capacity: self.count / 2)
    var hex = self
    while hex.count > 0 {
      let subIndex = hex.index(hex.startIndex, offsetBy: 2)
      let c = String(hex[..<subIndex])
      hex = String(hex[subIndex...])
      if let ch = UInt8(c, radix: 16) {
        data.append(ch)
      }
    }
    return data
  }
}

extension Data {
  func toHexString() -> String {
    return map { String(format: "%02x", $0) }.joined()
  }
}
