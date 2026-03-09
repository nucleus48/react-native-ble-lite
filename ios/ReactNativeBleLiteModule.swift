import ExpoModulesCore
import CoreBluetooth

public class ReactNativeBleLiteModule: Module, CBCentralManagerDelegate, CBPeripheralManagerDelegate {
  private var centralManager: CBCentralManager?
  private var peripheralManager: CBPeripheralManager?
  
  private var scanningServiceUuid: CBUUID?
  private var advertisingServiceUuid: CBUUID?
  private var advertisingData: Data?

  public func definition() -> ModuleDefinition {
    Name("ReactNativeBleLite")

    Events("onAdvertisement")

    AsyncFunction("startScanning") { (serviceUuid: String) in
      let uuid = CBUUID(string: serviceUuid)
      self.scanningServiceUuid = uuid
      
      if centralManager == nil {
        centralManager = CBCentralManager(delegate: self, queue: nil)
      }
      
      if centralManager?.state == .poweredOn {
        centralManager?.scanForPeripherals(withServices: [uuid], options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
      }
    }

    AsyncFunction("stopScanning") {
      centralManager?.stopScan()
    }

    AsyncFunction("startAdvertising") { (serviceUuid: String, data: String) in
      let uuid = CBUUID(string: serviceUuid)
      self.advertisingServiceUuid = uuid
      self.advertisingData = data.toData()
      
      if peripheralManager == nil {
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
      }
      
      if peripheralManager?.state == .poweredOn {
        startAdvertisingInternal()
      }
    }

    AsyncFunction("stopAdvertising") {
      peripheralManager?.stopAdvertising()
    }
  }

  // MARK: - CBCentralManagerDelegate

  public func centralManagerDidUpdateState(_ central: CBCentralManager) {
    if central.state == .poweredOn, let uuid = scanningServiceUuid {
      central.scanForPeripherals(withServices: [uuid], options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
    }
  }

  public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    guard let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data],
          let uuid = scanningServiceUuid,
          let data = serviceData[uuid] else {
      // Even if no service data, we might still want to report the discovery if the UUID matched
      if let uuid = scanningServiceUuid {
         sendEvent("onAdvertisement", [
          "uuid": uuid.uuidString,
          "data": "",
          "rssi": RSSI,
          "deviceId": peripheral.identifier.uuidString
        ])
      }
      return
    }

    sendEvent("onAdvertisement", [
      "uuid": uuid.uuidString,
      "data": data.toHexString(),
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
    guard let uuid = advertisingServiceUuid else { return }
    
    // Note: iOS does not support common Service Data in advertisement packets for peripheral mode.
    // We only advertise the Service UUID.
    peripheralManager?.startAdvertising([
      CBAdvertisementDataServiceUUIDsKey: [uuid]
    ])
  }
}

extension String {
  func toData() -> Data? {
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
