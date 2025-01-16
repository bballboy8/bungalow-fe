import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import dayjs from 'dayjs';
import { SatelliteService } from '../../services/satellite.service';
import { GroupsListComponent } from '../../common/groups-list/groups-list.component';
import { catchError, debounceTime, of, Subject, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { DateFormatPipe, DateTimeFormatPipe } from '../../pipes/date-format.pipe';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';

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
    GroupsListComponent,
    DateFormatPipe,
    DateTimeFormatPipe
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
  activeTimeDate: any
  searchInput = new Subject<string>();
  name: string = "Untitled point";
  pointData: any
  addGroup: boolean = false;
  selectedGroup: any = null;
  activeGroup: any;
  private snackBar = inject(MatSnackBar);
  @ViewChild(GroupsListComponent) childComponent!: GroupsListComponent;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  siteData: any;
  isHovered:boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private satelliteService: SatelliteService,private overlayContainer: OverlayContainer) {
    // Apply debounceTime to the Subject and switch to the latest observable (API call)
    this.searchInput.pipe(
      debounceTime(1000),  // Wait for 1000ms after the last key press
      switchMap((inputValue) => {
        const data = { group_name: inputValue };
        return this.satelliteService.getGroupsForAssignment(data).pipe(
          catchError((err) => {
            console.error('API error:', err);
            // Return an empty array to allow subsequent API calls to be made
            return of({ data: [] });
          })
        );
      })
    ).subscribe({
      next: (resp) => {
        console.log(resp, 'API Response');
        this.groups = resp?.data;
      },
      error: (err) => {
        console.error('API call failed', err);
      }
    });
  }

  ngOnInit(): void {
    console.log(this.data, 'datataatatatatatattat');
    this.renderGroup = this.myTemplate;
    this.activeTimeDate = this.data?.markerData?.percentages[this.selectedTimeFrame]
    if (this.data.type === 'marker') {
      this.handleMarkerAdded(this.data.pointData)
    } else {
      this.pointData = this.data.shapeData
    }

  }

  activeTimeFrame(time: any) {
    this.selectedTimeFrame = time;
    this.activeTimeDate = this.data?.markerData?.percentages[time]
  }

  formatDate(date: any) {
    return dayjs(date).format('DD.MM.YY');
  }

  getGroups() {
    this.selectedGroupEvent(null)
    if (this.addGroup) {
      const data = {
        group_name: ''
      }
      this.satelliteService.getGroupsForAssignment(data).subscribe({
        next: (resp) => {
          console.log(resp, 'respresprespresprespresprespresprespresp');
          this.groups = resp

        }
      })
    } else {
      this.snackBar.open('Please first add site.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }

  }

  onKeyPress(event: KeyboardEvent): void {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(inputValue, 'inputValueinputValueinputValue'); // Log the current input value to the console
    const data = {
      group_name: inputValue
    }
    // this.satelliteService.getGroupsForAssignment(data).subscribe({
    //   next: (resp) => {
    //     console.log(resp,'respresprespresprespresprespresprespresp');

    //     this.groups = resp?.data

    //   }})
    console.log(this.searchInput, 'searchiiiiiiiiiiiiiiiii');

    this.searchInput.next(inputValue);
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

  //Function to generate circle plygon when marker added to the map
  handleMarkerAdded(data: any) {
    console.log(data, 'mark');

    const payload = {
      latitude: data.latitude,
      longitude: data.longitude,
      distance_km: 1
    }
    this.satelliteService.generateCirclePolygon(payload).subscribe({
      next: (resp) => {

        this.pointData = resp.data;
        console.log('pointDatapointDatapointData', resp);
      }
    })
  }

  //Add site to the group

  addSite() {
    let payload
    if (this.pointData) {
      payload = {
        name: this.name,
        coordinates_record: {
          type: "Polygon",
          coordinates: this.pointData?.coordinates
        },
        site_type: this.pointData?.type
      }
    } else {
      console.log('kkkkkkkkkk');
      
      payload = {
        name: this.name,
        coordinates_record: {
          type: "Polygon",
          coordinates: this.data.vendorData?.coordinates_record?.coordinates
        },
        site_type: this.data.vendorData?.coordinates_record?.coordinates[0].length > 5 ? 'Polygon' : 'Rectangle'
      }
    }

    this.satelliteService.addSite(payload).subscribe({
      next: (resp) => {
        this.snackBar.open('Site has been added.', 'Ok', {
          duration: 2000  // Snackbar will disappear after 300 milliseconds
        });
        console.log(resp, 'successsuccesssuccesssuccess');
        this.siteData = resp
        this.addGroup = true;  // This will execute if the API call is successful

      },
      error: (err) => {
        console.error('Error occurred:', err);

        this.addGroup = false;



      }
    });

  }

  selectedGroupEvent(event: any) {
    console.log(event, 'selectedeventeventeventevent');
    this.activeGroup = event
  }

  saveGroup() {
    this.selectedGroup = this.activeGroup.group
    const payload = {
      group_id: this.selectedGroup.id,
      site_id: this.siteData.id
    }
    this.satelliteService.addGroupSite(payload).subscribe({
      next: (res) => {
        console.log(res, 'updatedaaaaaaaaaaaaaaaaaa');
        this.snackBar.open(res.message, 'Ok', {
          duration: 2000  // Snackbar will disappear after 300 milliseconds
        });
      },
      error: (err) => {

      }
    })
    this.closeMenu()
  }
  closeMenu() {
    // Close the menu
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }

  copyToClipboard(data: any): void {
    console.log(data,'datadatadatadatadatadatadatadatadata');
    
   if (data.distance) {
      const text =  data
      // Create a temporary input element to copy text
      const inputElement = document.createElement('input');
      inputElement.value = `${text?.latitude.toFixed(4)},${text?.longitude.toFixed(4)}`;
      document.body.appendChild(inputElement);
      inputElement.select();
      document.execCommand('copy');
      document.body.removeChild(inputElement);

      // Optionally alert the user

      this.snackBar.open('Copied successfully!', 'Ok', {
        duration: 2000  // Snackbar will disappear after 300 milliseconds
      });
    } else if(data){
      const text =  this.getPolygonCenter(data)
      // Create a temporary input element to copy text
      const inputElement = document.createElement('input');
      inputElement.value = `${text?.lat.toFixed(4)},${text?.lon.toFixed(4)}`;
      document.body.appendChild(inputElement);
      inputElement.select();
      document.execCommand('copy');
      document.body.removeChild(inputElement);

      // Optionally alert the user

      this.snackBar.open('Copied successfully!', 'Ok', {
        duration: 2000  // Snackbar will disappear after 300 milliseconds
      });
    }
    
  }

  getDateTimeFormat(dateTime: string) {
    if (dateTime) {
      return moment(dateTime, 'YYYY-MM-DD    HH:mm:ss')?.format('YYYY-MM-DD     HH:mm:ss');

    }
    return '';
  }

   // Function to toggle hover state
   toggleHover(state: boolean): void {
    this.isHovered = state;
  }

  roundOff(value: number): number {
    return Math.round(value);
  }

  toDecimal(value:number){
    return parseFloat(value.toFixed(4));
  }

  getPolygonCenter(coordinates: number[][]): { lat: number; lon: number } | null {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      console.error('Invalid or empty coordinates array');
      return null;
    }
  
    const validCoordinates = coordinates.filter(([lon, lat]) => 
      typeof lon === 'number' && typeof lat === 'number'
    );
  
    if (validCoordinates.length === 0) {
      console.error('No valid coordinates found');
      return null;
    }
  
    let totalLat = 0;
    let totalLon = 0;
  
    validCoordinates.forEach(([lon, lat]) => {
      totalLat += lat;
      totalLon += lon;
    });
    console.log(totalLat / validCoordinates.length,'totalLat / numPointstotalLat / numPointstotalLat / numPoints',totalLon / validCoordinates.length)
  
    return {
      lat: totalLat / validCoordinates.length,
      lon: totalLon / validCoordinates.length,
    };
  }
  
  formatToThreeDecimalPlaces(value: string): string {
    // Check if the string ends with "m"

    // Extract the numeric part and parse it as a float
    const numericPart = parseFloat(value.slice(0, -1));
    // Format the numeric part to 3 decimal places
    const formattedNumber = numericPart.toFixed(2);

    // Reattach the "m" unit and return
    return `${formattedNumber}m`;
}

getDayOfWeek(date: Date): string {
  
    // Get day of the week in local time
    return dayjs(date).utc().format('dddd');
  
}

//Getting time in Day sessions
getTimePeriod(datetime: string): string {
  const date = new Date(datetime); // Parse the ISO string to a Date object
    const hours = date.getHours(); // Get the hour (0-23)
  
    if (hours >= 5 && hours < 11) {
      return "Morning";
    } else if (hours >= 11 && hours < 16) {
      return "Midday";
    } else if (hours >= 16 && hours < 21) {
      return "Evening";
    } else {
      return "Overnight";
    }
}

//Copy thumbnail data to clipboard
copyData(data: any) {
  const { acquisition_datetime,sensor, vendor_name, vendor_id, centroid } = data;
  if (!centroid || !Array.isArray(centroid)) {
    this.snackBar.open('Invalid data format!', 'Ok', { duration: 2000 });
    return;
  }

  const result = `${acquisition_datetime},${sensor},${vendor_name},${vendor_id},${centroid.join(",")}`;

  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = result;
  tempTextArea.style.position = 'fixed'; // Avoid scrolling to view the element
  tempTextArea.style.opacity = '0';     // Make it invisible
  document.body.appendChild(tempTextArea);

  tempTextArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
    
      this.snackBar.open('Copied successfully!', 'Ok', { duration: 2000 });
    } else {
     
      this.snackBar.open('Failed to copy text.', 'Retry', { duration: 2000 });
    }
  } catch (err) {
   
    this.snackBar.open('Failed to copy text.', 'Retry', { duration: 2000 });
  }

  document.body.removeChild(tempTextArea);
}

getVendors(vendorCount) {
    return Object.keys(vendorCount) || [];
}

//Get time in local and utc time zone functionality
getTime(datetime:any,type:any){
  if (type === 'utc') {
    // Get UTC time
    const utcDate = dayjs(datetime).utc();
    const utcTime = utcDate.format('HH:mm'); // Format as 'HH:mm'
  
    return `${utcTime}`;
  } else {
    // Get local time
    const localDate = new Date(datetime);
    const localHours = localDate.getHours().toString().padStart(2, '0');
    const localMinutes = localDate.getMinutes().toString().padStart(2, '0');
    const localTime = `${localHours}:${localMinutes}`; // Format as 'HH:mm'
  
    return `${localTime}`;
  }
  
}

setClass(){
  const containerElement = this.overlayContainer.getContainerElement();
  containerElement.classList.add('popup-overlay-container');
 
}

imagePreview(data:any,type:any) {
    const dialogRef = this.dialog.open(ImagePreviewComponent, {
      width: "880px",
      maxHeight:'700px',
      data:  {images:data, type:type} ,
      panelClass: "custom-preview",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Selected date range:", result);
      }
    });
  }

}
