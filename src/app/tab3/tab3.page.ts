import { literal } from '@angular/compiler/src/output/output_ast';
import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { isAuthConnection } from 'ionic';
import { Tab1Page } from '../tab1/tab1.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  buttonText: String;
  notifications: boolean;
  unpairedDevices: any;
  pairedDevices: any;
  // Store selected device
  selectedDevice: any;
  gettingDevices: boolean;
  // Received Stats
  stats: any;
  
  constructor(private bluetoothSerial: BluetoothSerial, private alertController: AlertController) {
    this.buttonText = 'Connect';
    bluetoothSerial.enable();
  }

  onConnect()
  {
   
    if (this.notifications) this.notifications = false;
    else this.notifications = true;

    if (this.buttonText == "Connect")
    {
      this.selectDevice(this.selectedDevice.address);
      // depreciated this.bluetoothSerial.connect(this.selectedDevice.address)
      if (this.bluetoothSerial.isConnected()) 
        this.ELM327_Init();

      this.buttonText='Disconnect';
      alert("Conected to "  + this.selectedDevice.name);
    } else {
      // If connected then disconnect
      if (!this.bluetoothSerial.isConnected())
        this.disconnect();
      this.buttonText='Connect';
    }
  }

  optionSelectFn()
  {
    this.showAlert("optionSelect","Conected - " + this.selectedDevice.name);
  }
  
  ELM327_Init()
  {
    //  Initialize the ELM327 to transmit and receive data
    this.SendData("AT+RESET\n"); // Reset 
    this.SendData("AT+ORGL\n"); // (Set to original)
    this.SendData("AT+ROLE=1\n"); // (Set to Master)
    this.SendData("AT+CMODE=0\n"); // (Set connect to a specific address)
    this.SendData("AT+BIND=" + this.selectedDevice.address  + "\n");
    this.SendData("AT+INIT\n"); // (Need to connect)
    this.SendData("AT+PAIR=" + + this.selectedDevice.address + "\n"); // ( 20 second timeout)
    this.SendData("AT+LINK=" + this.selectedDevice.address +"\n"); // Linking
    this.showAlert("ELM327", "Initialized...");
    this.getStats();
  }

  // Getting Engine Stats
  getStats()
  {
    if(this.bluetoothSerial.isConnected()) {
      this.SendData("ATD");
      this.ReceiveData(); 
      
      this.SendData("ATZ");
      this.ReceiveData();

      this.SendData("ATSP0");
      this.ReceiveData();

      this.SendData("0105"); // Coolant Temperature
      this.ReceiveData();
      // Set Coolant Vlaue
      if (this.stats != "")
        Tab1Page.arguments.coolantTemp = this.stats;

      this.SendData("0110"); // Fuel Pressure
      this.ReceiveData();
      // Set Fuel Pressure Value
      if (this.stats != "")
        Tab1Page.arguments.fuelPressure = this.stats;

      this.SendData("015c"); // Oil Temperature
      this.ReceiveData();
      // Set Oil Temperature Gauge
      if (this.stats != "")
        Tab1Page.arguments.oilTemp = this.stats;

    } else {
      this.showAlert("Notification", "Device Not Connected");
    }
  }


  async showAlert(Header, Message) {
    const alert = await this.alertController.create({
    header: Header,
    subHeader: Message,
    buttons: ['Dismiss']
   });
   await alert.present(); 
}

  SendData(data)
  {
    this.bluetoothSerial.write(data).then(Success => {
      // Show response from device
      this.ReceiveData();
    }, error => {
      this.showAlert("Send Error", error);
    })
  }

  ReceiveData()
  {
    if(this.bluetoothSerial.available())
    {
      this.stats = this.bluetoothSerial.read();
    }
    
    if (this.stats != "")
          this.showAlert("Receive Error", this.stats); 
  }
  

  // Scan for paired bluetooth devices
  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    const unPair = [];
    this.bluetoothSerial.discoverUnpaired().then((success) => {
      success.forEach((value, key) => {
        var exists = false;
        unPair.forEach((val2, i) => {
          if (value.id === val2.id) {
            exists = true;
          }
        });
        if (exists === false && value.id !== '') {
          unPair.push(value);
        }
      });
      this.unpairedDevices = unPair;
      this.gettingDevices = false;
    },
      (err) => {
        console.log(err);
      });
  
    this.bluetoothSerial.list().then((success) => {
      this.pairedDevices = success;
    },
      (err) => {
        console.log(err);
      });
    }
  
  success = (data) => {
    this.deviceConnected();
  }
  fail = (error) => {
    alert(error);
  }
  
  async selectDevice(id: any) {
  
    const alert = await this.alertController.create({
      header: 'Connect',
      message: 'Do you want to connect with?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connect',
          handler: () => {
            this.bluetoothSerial.connect(id).subscribe(this.success, this.fail);
          }
        }
      ]
    });
    await alert.present();
  }
  
  deviceConnected() {
    this.bluetoothSerial.isConnected().then(success => {
      alert('Connected Successfullly');
    }, error => {
      alert('error' + JSON.stringify(error));
    });
  }
  
  async disconnect() {
    const alert = await this.alertController.create({
      header: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect();
          }
        }
      ]
    });
    await alert.present();
  }
}
