import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  fuelPressure: number;
  oilPressure: number;
  oilTemp: number;
  coolantTemp: number;

 constructor() {
 
   this.getValues();
   // setInterval( () => { this.coolant = .65;}, 1000 );  // Temp value for testing
   // setInterval( () => { this.oilpressure = .75;}, 1000 );  // Temp value for testing
   // setInterval( () => { this.fuelpressure = .11;}, 1000 ); // Temp value for testing
 }
 
 // This updates the values for the gauges
 setGauges(){
   setInterval( () => { this.coolantTemp = .85;}, 1000 );  // Temp value for testing
   setInterval( () => { this.oilTemp = .45;}, 1000 );  // Temp value for testing
   setInterval( () => { this.fuelPressure = .21;}, 1000 ); // Temp value for testing
 }

 // This loads the values form the ECM on the car 
 getValues()
 {
   // Update gauge values 
   this.setGauges();
 }

}
