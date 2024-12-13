import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import dayjs from 'dayjs';
import { SatelliteService } from '../../services/satellite.service';
import { GroupsListComponent } from '../../common/groups-list/groups-list.component';

export class Group {
  name?: string;
  icon?: string; // icon name for Angular Material icons
  children?: Group[]; // nested groups
}

@Component({
  selector: 'app-map-controllers-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    GroupsListComponent
  ],
  templateUrl: './map-controllers-popup.component.html',
  styleUrls: ['./map-controllers-popup.component.scss']
})
export class MapControllersPopupComponent implements OnInit {
  @ViewChild('myTemplate', { static: true }) myTemplate!: TemplateRef<any>;
  selectedTimeFrame: any = 1;
  renderGroup!: TemplateRef<any> | null;
  checked: boolean = false;
  groups: Group[] = [
    // Add more groups as needed
  ];
  activeTimeDate:any

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private satelliteService:SatelliteService,) {}

  ngOnInit(): void {
    console.log(this.data, 'datataatatatatatattat');
    this.renderGroup = this.myTemplate;
    this.activeTimeDate = this.data?.markerData?.percentages[this.selectedTimeFrame]
  }

  activeTimeFrame(time: any) {
    this.selectedTimeFrame = time;
    this.activeTimeDate = this.data?.markerData?.percentages[time]
  }

  formatDate(date: any) {
    return dayjs(date).format('DD.MM.YY');
  }

  getGroups(){
    const data = {
      group_name:''
    }
    this.satelliteService.getGroupsForAssignment(data).subscribe({
      next: (resp) => {
        console.log(resp,'respresprespresprespresprespresprespresp');
        
        this.groups = resp
        
      }})
  }

  onKeyPress(event: KeyboardEvent): void {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(inputValue,'inputValueinputValueinputValue'); // Log the current input value to the console
    const data = {
      group_name:inputValue
    }
    this.satelliteService.getGroupsForAssignment(data).subscribe({
      next: (resp) => {
        console.log(resp,'respresprespresprespresprespresprespresp');
        
        this.groups = resp?.data
        
      }})
  }

   getTimeIfWithin24Hours(acquisition_datetime: string): string | null {
    // Convert the acquisition_datetime string into a Date object
    const acquisitionDate = new Date(acquisition_datetime);
  
    // Get the current date and time
    const currentDate = new Date();
  
    // Calculate the difference between the current date and acquisition date in milliseconds
    const timeDifference = currentDate.getTime() - acquisitionDate.getTime();
  
    // Define 24 hours in milliseconds (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  
    // Check if the acquisition date is within the last 24 hours
    if (timeDifference <= twentyFourHoursInMs) {
      // If it's within 24 hours, return the time portion of the date (formatted as needed)
      return acquisitionDate.toLocaleTimeString(); // You can adjust the format if needed
    }
  
    // Return null if the acquisition date is not within the last 24 hours
    return dayjs(acquisition_datetime).format('DD.MM.YY');;
  }
  
  
}
