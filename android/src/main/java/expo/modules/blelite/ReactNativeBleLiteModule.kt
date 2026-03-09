package expo.modules.blelite

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable
import java.util.*

enum class ScanMode(val value: Int) : Enumerable {
  LOW_POWER(0),
  BALANCED(1),
  LOW_LATENCY(2),
  OPPORTUNISTIC(-1)
}

enum class AdvertiseMode(val value: Int) : Enumerable {
  LOW_POWER(0),
  BALANCED(1),
  LOW_LATENCY(2)
}

enum class AdvertisePower(val value: Int) : Enumerable {
  ULTRA_LOW(0),
  LOW(1),
  MEDIUM(2),
  HIGH(3)
}

class ScanOptions : Record {
  @Field
  val serviceUuid: String = ""

  @Field
  val scanMode: ScanMode = ScanMode.BALANCED

  @Field
  val allowDuplicates: Boolean = true
}

class AdvertiseOptions : Record {
  @Field
  val serviceUuid: String = ""

  @Field
  val data: String = ""

  @Field
  val advertiseMode: AdvertiseMode = AdvertiseMode.LOW_LATENCY

  @Field
  val powerLevel: AdvertisePower = AdvertisePower.HIGH

  @Field
  val connectable: Boolean = false

  @Field
  val includeDeviceName: Boolean = false
}

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

    AsyncFunction("startScanning") { options: ScanOptions ->
      val scanner = bluetoothAdapter?.bluetoothLeScanner ?: throw BluetoothNotAvailableException()
      
      stopScanningInternal()

      val filter = ScanFilter.Builder()
        .setServiceUuid(ParcelUuid(UUID.fromString(options.serviceUuid)))
        .build()

      val settings = ScanSettings.Builder()
        .setScanMode(options.scanMode.value)
        .build()

      scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
          val device = result.device
          val scanRecord = result.scanRecord ?: return
          val serviceData = scanRecord.serviceData[ParcelUuid(UUID.fromString(options.serviceUuid))] ?: byteArrayOf()
          
          sendEvent("onAdvertisement", mapOf(
            "uuid" to options.serviceUuid,
            "data" to serviceData.toHexString(),
            "rssi" to result.rssi,
            "deviceId" to device.address
          ))
        }

        override fun onScanFailed(errorCode: Int) {
          // Handle scan failure if needed
        }
      }

      scanner.startScan(listOf(filter), settings, scanCallback)
    }

    AsyncFunction("stopScanning") {
      stopScanningInternal()
    }

    AsyncFunction("startAdvertising") { options: AdvertiseOptions ->
      val advertiser = bluetoothAdapter?.bluetoothLeAdvertiser ?: throw BluetoothNotAvailableException()
      
      stopAdvertisingInternal()

      val uuid = UUID.fromString(options.serviceUuid)
      val dataBytes = options.data.decodeHex()

      val settings = AdvertiseSettings.Builder()
        .setAdvertiseMode(options.advertiseMode.value)
        .setTxPowerLevel(options.powerLevel.value)
        .setConnectable(options.connectable)
        .build()

      val advertiseData = AdvertiseData.Builder()
        .addServiceUuid(ParcelUuid(uuid))
        .addServiceData(ParcelUuid(uuid), dataBytes)
        .setIncludeDeviceName(options.includeDeviceName)
        .setIncludeTxPowerLevel(false)
        .build()

      advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
          super.onStartSuccess(settingsInEffect)
        }

        override fun onStartFailure(errorCode: Int) {
          // Handle advertising failure
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
    if (isEmpty()) return byteArrayOf()
    check(length % 2 == 0) { "Must have an even length" }
    return chunked(2)
      .map { it.toInt(16).toByte() }
      .toByteArray()
  }
}

class BluetoothNotAvailableException : Exception("Bluetooth is not available on this device")
