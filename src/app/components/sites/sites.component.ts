import { AfterViewInit, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SatelliteService } from '../../services/satellite.service';
import dayjs from 'dayjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, debounceTime, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [MatInputModule,NgApexchartsModule,MatMenuModule,CommonModule,MatInputModule,MatFormFieldModule,ReactiveFormsModule,FormsModule],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit, AfterViewInit {
  @Output() closeDrawer = new EventEmitter<boolean>();
  private _snackBar = inject(MatSnackBar);
    options: any;
    notification:boolean = false;
    name:string=''
    sitesData:any[] = [];
     searchInput = new Subject<string>();
  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  }
  ngOnInit(): void {
    
      let queryParams ={
        page_number: '1',
        per_page: '12',
        name:'',
      }
     this.getSitesData(queryParams)
  }
  constructor(private sateliteService:SatelliteService){
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
            ranges: [
              {
                from: 0,
                to: 1,
                name: 'low',
                color: '#00A100',
              },
              {
                from: 2,
                to: 3,
                name: 'medium',
                color: '#128FD9',
              },
              {
                from: 4,
                to: 5,
                name: 'high',
                color: '#FFB200',
              },
            ],
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 0,
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
      yaxis:{
        labels:{
          show: false
        }
      }
    };
   
    this.searchInput.pipe(
              debounceTime(1000),  // Wait for 1000ms after the last key press
              switchMap((inputValue) => {
                let queryParams ={
                  page_number: '1',
                  per_page: '12',
                  name:inputValue,
                }
                
                return this.sateliteService.getSites(queryParams).pipe(
                  catchError((err) => {
                    console.error('API error:', err);
                    // Return an empty array to allow subsequent API calls to be made
                    return of({ data: [] });
                  })
                );
              })
            ).subscribe({
              next: (resp:any) => {
                console.log(resp, 'API Response');
                this.sitesData = resp?.data;
              },
              error: (err:any) => {
                console.error('API call failed', err);
              }
            });
  }    
  ngAfterViewInit(): void {
    
  }

  initializeCharts() {
    for (let i = 0; i < this.sitesData.length; i++) {     
      const chartElement = document.querySelector(`#chart${i}`);
      if (chartElement && !chartElement.hasChildNodes()) {
        const heatmapData = this.sitesData[i].heatmap.map((item: { date: string; count: number }) => ({
          x: item.date,
          y: item.count,
        }));
  
        const chartOptions = {
          ...this.options,
          series: [
            {
              name: `Site ${i + 1}`,
              data: heatmapData,
            },
          ],
        };

        const chart = new ApexCharts(chartElement, chartOptions);
        chart.render()
          .then(() => console.log(''))
          .catch((err) => console.error(`Error rendering chart ${i}:`, err));
      }
    }
  }
  
  generateData(count: number, range: { min: number, max: number }) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
  }

  //Date format functions
  getFormattedDate(date: Date): string {
      return dayjs(date).format('MM.DD.YYYY');
  }

  //Getting sites data
  getSitesData(queryParams:any){
    this.sateliteService.getSites(queryParams).subscribe({
      next: (resp) => {
        console.log(resp,'successsuccesssuccesssuccesssuccess');
        this.sitesData = resp.data;
        setTimeout(() => {
          this.initializeCharts();
        },300)
       
      }})
  }

  //Patch name value into input field
  patchNameValue(site:any){
    this.name = site.name
  }

  //Notifications ative status 
  notificatioStatus(type:boolean,site:any){
    this.notification = type;
    console.log(site,'sitesitesitesitesitesitesite');
    const payload = {
      site_id:site.id,
      name:site.name,
      notification:type,
      is_deleted:false,
    }

    this.sateliteService.updateSite(payload).subscribe({
      next: (resp) => {
        let queryParams ={
          page_number: '1',
          per_page: '12',
          name:'',
        }
        this.getSitesData(queryParams)
        
      }
    })
    
  }

  updateSite(type:any,site:any){
    let payload:any
    if(type=='rename'){
      payload = {
        site_id:site.id,
        name:this.name,
        notification:site.notification,
        is_deleted:false,
      }
      const updatedSitesData = this.sitesData.map((item:any) =>
        item.id === site.id ? { ...site, name: this.name } : item
      );
      this.sitesData = updatedSitesData
    } else if (type == 'delete') {
      
      const index = this.sitesData.findIndex((item) => item.id === site.id);

      // Remove the object if found
      if (index !== -1) {
        this.sitesData.splice(index, 1); // Removes 1 element at the found index
      }
      
    } else{
     
      const updatedSitesData = this.sitesData.map((item:any) =>
        item.id === site.id ? { ...site, notification: type } : item
      );
      this.sitesData = updatedSitesData
    }
    this.sateliteService.updateSite(payload).subscribe({
      next: (resp) => {
       if(resp){
        this._snackBar.open('Site updated successfully.', 'Ok', {
          duration: 2000  // Snackbar will disappear after 300 milliseconds
        });
       }
       
       
      }
    })
  }

  //On Keypress filter sites data
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
}

