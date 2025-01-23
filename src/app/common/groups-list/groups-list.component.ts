import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, input, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { CommonDailogsComponent } from '../../dailogs/common-dailogs/common-dailogs.component';
import { SatelliteService } from '../../services/satellite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../components/shared/shared.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, DateFormatPipe, MatMenuModule,NgApexchartsModule],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.scss'
})
export class GroupsListComponent {
  @Input() group: any; // Current group data
  isExpanded = false; // Tracks expand/collapse state
  @Input() backgroundColor: string = '#191E22';
  @Input() index: any
  activeIndex: any;
  @Output() selectedGroup = new EventEmitter<{}>();
  @Input() type: string = ''
  @Input() padding: string = '';
  private _snackBar = inject(MatSnackBar);
  site_objects_count:any;
  siteDetail:any = {
    acquisition_count: 219,frequency: 2.5,gap: 6.792676837905093,heatmap: [{date: "2025-01-01", count: 2}],
    id: 3,most_recent: "2024-12-05T03:32:13.282960Z",most_recent_clear: "2024-08-30T09:01:44Z",
    name: "W", notification: false, site_type: "Polygon"};
    options: any;
    activeSite:any;
  constructor(private overlayContainer: OverlayContainer,
    private dialog: MatDialog,
    private satelliteService:SatelliteService,
    private SharedService: SharedService
  ) { 
  }

  
  toggle(group: any) {
    
    if (group !== this.activeIndex) {
      this.activeIndex = group
    
    } else {
      this.activeIndex = null;
    }
    this.isExpanded = !this.isExpanded; // Toggle expand/collapse
    this.backgroundColor = this.isExpanded ? '#232B32' : '#191E22';
    if (this.isExpanded) {
      this.selectedGroup.emit({ group })
    }
  }

  setClass() {
    const containerElement = this.overlayContainer.getContainerElement();
    containerElement.classList.add('group-overlay-container');

  }

  addGroup(type: string, group: any) {
    let data
    if (type == 'addGroup') {
      data = { type: type }
    } else {
      data = { type: type, parent: group.id}
    }

    console.log(group, 'sssssssssssssssssss');

    this.openDialog(data)
  }

  renameGroup(type: any, group: any) {
    const data = { type: type, group: group}
    this.openDialog(data)
  }

  deleteGroup(type: any, group: any) {
    const data = { type: type, group: group}
    this.openDialog(data)
  }

  setNotifications(status:boolean,group:any){
    const payload = {
      group_id: group.id,
      notification: status,
      name:group?.name
    }
    this.satelliteService.updateGroup(payload).subscribe({
      next: (resp) =>{
        this.SharedService.setNestedGroup(true);
      }
    })
  }

  openDialog(data: any) {
    const dialogRef = this.dialog.open(CommonDailogsComponent, {
      width: '350px',
      height: 'auto',
      data: data,
      panelClass: 'custom-dialog-class',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(' closed', result);
      if(result){
        this.SharedService.setNestedGroup(true);
      }
      
      this._snackBar.open('Group updated successfully.', 'Ok', {
        duration: 2000  // Snackbar will disappear after 300 milliseconds
      });
     
    });
  }
  // Round off value
  roundOff(value: number): any {
    return Math.round(value);
  }

  //Padding adjustments
  getPadding(value){
    console.log(value,'valuevaluevaluevaluevaluevaluevaluevaluevalue');
    
    const newValue = parseInt(value) -10;
    console.log(newValue.toString(),'valuevaluevaluevaluevaluevaluevaluevaluevalue');
    
    return newValue.toString()
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
