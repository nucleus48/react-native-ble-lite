package expo.modules.blelite

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*

class ReactNativeBleLiteModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.AppContextLost()

  private val bluetoothManager: BluetoothManager
    get() = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

  private val bluetoothAdapter: BluetoothAdapter?
    get() = bluetoothManager.adapter

  private var scanCallback: ScanCallback? = null
  private var advertiseCallback: AdvertiseCallback? = null

  override fun definition() = ModuleDefinition {
    Name("ReactNativeBleLite")

    Events("onAdvertisement")

    AsyncFunction("startScanning") { serviceUuid: String ->
      val scanner = bluetoothAdapter?.bluetoothLeScanner ?: return@AsyncFunction
      
      stopScanningInternal()

      val filter = ScanFilter.Builder()
        .setServiceUuid(ParcelUuid(UUID.fromString(serviceUuid)))
        .build()

      val settings = ScanSettings.Builder()
        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
        .build()

      scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
          val device = result.device
          val scanRecord = result.scanRecord ?: return
          val serviceData = scanRecord.serviceData[ParcelUuid(UUID.fromString(serviceUuid))] ?: byteArrayOf()
          
          sendEvent("onAdvertisement", mapOf(
            "uuid" to serviceUuid,
            "data" to serviceData.toHexString(),
            "rssi" to result.rssi,
            "deviceId" to device.address
          ))
        }

        override fun onScanFailed(errorCode: Int) {
          // TODO: handle scan failure?
        }
      }

      scanner.startScan(listOf(filter), settings, scanCallback)
    }

    AsyncFunction("stopScanning") {
      stopScanningInternal()
    }

    AsyncFunction("startAdvertising") { serviceUuid: String, data: String ->
      val advertiser = bluetoothAdapter?.bluetoothLeAdvertiser ?: return@AsyncFunction
      
      stopAdvertisingInternal()

      val uuid = UUID.fromString(serviceUuid)
      val dataBytes = data.decodeHex()

      val settings = AdvertiseSettings.Builder()
        .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
        .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
        .setConnectable(false)
        .build()

      val advertiseData = AdvertiseData.Builder()
        .addServiceUuid(ParcelUuid(uuid))
        .addServiceData(ParcelUuid(uuid), dataBytes)
        .setIncludeDeviceName(false)
        .setIncludeTxPowerLevel(false)
        .build()

      advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
          super.onStartSuccess(settingsInEffect)
        }

        override fun onStartFailure(errorCode: Int) {
          super.onStartFailure(errorCode)
        }
      }

      advertiser.startAdvertising(settings, advertiseData, advertiseCallback)
    }

    AsyncFunction("stopAdvertising") {
      stopAdvertisingInternal()
    }
  }

  private fun stopScanningInternal() {
    val scanner = bluetoothAdapter?.bluetoothLeScanner
    scanCallback?.let {
      scanner?.stopScan(it)
      scanCallback = null
    }
  }

  private fun stopAdvertisingInternal() {
    val advertiser = bluetoothAdapter?.bluetoothLeAdvertiser
    advertiseCallback?.let {
      advertiser?.stopAdvertising(it)
      advertiseCallback = null
    }
  }

  private fun ByteArray.toHexString(): String {
    return joinToString("") { "%02x".format(it) }
  }

  private fun String.decodeHex(): ByteArray {
    check(length % 2 == 0) { "Must have an even length" }
    return chunked(2)
      .map { it.toInt(16).toByte() }
      .toByteArray()
  }
}
