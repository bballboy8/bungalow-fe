import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { GroupsListComponent } from '../../common/groups-list/groups-list.component';
import { SatelliteService } from '../../services/satellite.service';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, of, Subject, switchMap } from 'rxjs';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonDailogsComponent } from '../../dailogs/common-dailogs/common-dailogs.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../shared/shared.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';

// export class Group {
//   name?: string;
//   icon?: string; // icon name for Angular Material icons
//   children?: Group[]; // nested groups
// }

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule,GroupsListComponent,MatInputModule,DateFormatPipe,MatMenuModule,NgApexchartsModule,],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent implements OnInit,AfterViewInit {
  groups = [];
  activeGroup:any;
  @Output() closeDrawer = new EventEmitter<boolean>();
  searchInput = new Subject<string>();
  activeIndex:number  = null;
  nestedGroupsData:any = [];
  parentGroupID:any = null
  private _snackBar = inject(MatSnackBar);
  activeSite:any;
  siteDetail:any = {
    acquisition_count: 219,frequency: 2.5,gap: 6.792676837905093,heatmap: [{date: "2025-01-01", count: 2}],
    id: 3,most_recent: "2024-12-05T03:32:13.282960Z",most_recent_clear: "2024-08-30T09:01:44Z",
    name: "W", notification: false, site_type: "Polygon"};
    options: any;
  constructor(
    private satelliteService:SatelliteService,
    private overlayContainer: OverlayContainer,
    private dialog: MatDialog,
    private sharedService: SharedService
  ){
    if(this.searchInput){
     this.searchInput.pipe(
          debounceTime(500),  // Wait for 1000ms after the last key press
          switchMap((inputValue) => {
            const data = {
              group_name:inputValue
            }
            
            return this.satelliteService.getParentGroups(data).pipe(
              catchError((err) => {
                
                console.error('API error:', err);
                // Return an empty array to allow subsequent API calls to be made
                return of({ data: [] });
              })
            );
          })
        ).subscribe({
          next: (resp: any) => {
            
            console.log(resp, 'API Response');
            this.groups = resp;
          },
          error: (err: any) => {
            console.error('API call failed', err);
          }
        });
      }
  }

  ngOnInit(): void {
    this.getGroups()
  }

  ngAfterViewInit(): void {
    this.sharedService.getNestedGroup$.subscribe((group:any) => {
      if(group){
        this.sharedService.updatedNestedGroup$.subscribe((state) => {
          console.log(state,'statestatestatestatestatestate');
          const data = {group_id:state}
          this.satelliteService.getNestedGroup(data).subscribe({
          next: (resp) => {
            console.log(resp,'getNestedGroupgetNestedGroupgetNestedGroupgetNestedGroup');
    
            this.nestedGroupsData = resp
    
          }})
        })
      }
    })
   
  }

  getGroups() {
    this.selectedGroupEvent(null)
   const params ={
      group_name:''

    }
  
      this.satelliteService.getParentGroups(params).subscribe({
        next: (resp) => {
          console.log(resp, 'respresprespresprespresprespresprespresp');
          this.groups = resp
  
        }
      })
    
  
  }
  selectedGroupEvent(event: any) {
    console.log(event, 'selectedeventeventeventevent');
    this.activeGroup = event
  }

  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  
  }

   //On Keypress filter groups data
   onKeyPress(event: KeyboardEvent): void {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(inputValue, 'inputValueinputValueinputValue'); // Log the current input value to the console

    // this.satelliteService.getGroupsForAssignment(data).subscribe({
    //   next: (resp) => {
    //     console.log(resp,'respresprespresprespresprespresprespresp');

    //     this.groups = resp?.data

    //   }})
    console.log(this.searchInput, 'searchiiiiiiiiiiiiiiiii');

    this.searchInput.next(inputValue);
  }

  rowExpanded(i,group){
    if(this.activeIndex !== i){
      this.activeIndex = i
      const data = {group_id:group.id}
      this.parentGroupID = group.id
      this.sharedService.setUpdatedNestedGroup(this.parentGroupID)
      this.satelliteService.getNestedGroup(data).subscribe({
      next: (resp) => {
        console.log(resp,'getNestedGroupgetNestedGroupgetNestedGroupgetNestedGroup');

        this.nestedGroupsData = resp

      }})

    } else {
      this.activeIndex = null
    }
   
  }

  setClass(){
    const containerElement = this.overlayContainer.getContainerElement();
    containerElement.classList.add('custom-cdk-overlay-container');  
  }

  //Add group functionality

  addGroup(type: string,group: any) {
    let data 
    if(type == 'addGroup'){
      data = {type: type}
    } else {
      data = {type: type, parent: group.id}
    }
   
   console.log(group,'sssssssssssssssssss');
   
   this.openDialog(data)
  }

  renameGroup(type:any,group:any){
    const data = {type:type, group:group}
    this.openDialog(data)
  }

  deleteGroup(type:any,group:any){
    const data = {type:type, group:group}
    this.openDialog(data)
  }

  openDialog(data:any){
    const dialogRef = this.dialog.open(CommonDailogsComponent, {
        width: '350px',
        height: 'auto',
        data: data,
        panelClass: 'custom-dialog-class',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog closed', result);
        if(result){
          this.getGroups();
        }
        // this.getUpdateGroup(result)
       

        this._snackBar.open('Group updated successfully.', 'Ok', {
          duration: 2000  // Snackbar will disappear after 300 milliseconds
        });
      });
  }

  setNotifications(status:boolean,group:any){
    const payload = {
      group_id: group.id,
      name: group?.name,
      notification: status,
    }
    this.satelliteService.updateGroup(payload).subscribe({
      next: (resp) =>{
        // this.getUpdateGroup(resp)
        this.getGroups()
      }
    })
  }

  getUpdateGroup(data) {
    const index = this.groups.findIndex(x => x.id == data.id);
    if (index>-1) {
      this.groups[index] = data;
    }
  }

  UpdateGroupEvent(event:any){
    console.log(event,'grouppppppppppppppppppppppppppppppppppppp');
    
  }

  // Round off value
  roundOff(value: number): any {
    return Math.round(value);
  }

  //Get site details
  getSitesDetail(site){
    if(this.activeSite !== site.id){
      this.activeSite = site.id;
      const colorRanges = this.generateUniqueColorRanges('');
      this.options = {
        chart: {
          height: 105,
          width: '255px',
          type: 'heatmap',
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            radius: 0,
            useFillColorAsStroke: true,
            columnWidth: '21px',
            rowHeight: '21px',
            colorScale: {
              ranges: colorRanges.map(range => ({
                from: range.from,
                to: range.to,
                name: '',
                color: range.color,
              }))
            }
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,               // Enable borders
          width: 1,                 // Set the width of the border
          colors: '#FFFFFF'         // Set the border color, you can change this to any color
        },
        legend: {
          show: false,
        },
        xaxis: {
          labels: {
            show: false, // Hides the x-axis labels
          },
          axisBorder: {
            show: false, // Hides the x-axis line
          },
          axisTicks: {
            show: false, // Hides the x-axis ticks
          },
        },
        yaxis: {
          labels: {
            show: false
          }
        }
      };
      setTimeout(() => {
        this.initializeCharts();
      }, 300)
    } else {
      this.activeSite = null
    }
  }
  //Intialize chart
  initializeCharts() {
      
        const chartElement = document.querySelector(`#chart`);
        if (chartElement && !chartElement.hasChildNodes()) {
          const heatmapData = this.siteDetail.heatmap.map((item: { date: string; count: number }) => ({
            x: item.date,
            y: item.count,
          }));
  
          const chartOptions = {
            ...this.options,
            series: [
              {
                name: `Site`,
                data: heatmapData,
              },
            ],
          };
  
          const chart = new ApexCharts(chartElement, chartOptions);
          chart.render()
            .then(() => console.log(''))
            .catch((err: any) => console.error(`Error rendering chart :`, err));
        }
      
    }

    generateUniqueColorRanges(data: any): any[] {
      const ranges = [];
  
      
        this.siteDetail.heatmap.forEach((item) => {
          ranges.push({
            from: item.count,
            to: item.count,
            color: this.generateColor()
          });
        });
  
      return ranges;
    }

    usedColors = new Set<string>();
    // Dynamically generate colors using HSL
    generateColor(): string {
      let color: string;
  
      // Keep generating random colors until a new one is found
      do {
        const hue = Math.floor(Math.random() * 360); // Random hue between 0 and 360
        const saturation = 70; // Vibrant colors (can be adjusted)
        const lightness = 50; // Balanced brightness (can be adjusted)
  
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } while (this.usedColors.has(color)); // Keep generating until a unique color is found
  
      // Store the new color to avoid using it again
      this.usedColors.add(color);
  
      return color;
    }
}
