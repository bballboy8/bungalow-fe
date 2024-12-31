import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SatelliteService } from '../../services/satellite.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [MatInputModule,NgApexchartsModule,MatMenuModule,CommonModule,MatInputModule,MatFormFieldModule,ReactiveFormsModule,FormsModule],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit, AfterViewInit {
  @Output() closeDrawer = new EventEmitter<boolean>();
  
    options: any;
    notification:boolean = false;
    name:string=''
    sitesData:any[] = [];
  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  }
  ngOnInit(): void {
    
      let queryParams ={
        page_number: '1',
        per_page: '12',
        name:'',
      }
      this.sateliteService.getSites(queryParams).subscribe({
        next: (resp) => {
          console.log(resp,'successsuccesssuccesssuccesssuccess');
          this.sitesData = resp.data;
          setTimeout(() => {
            this.initializeCharts();
          },300)
         
        }})
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
  }    
    ngAfterViewInit(): void {
     
    }
  
    initializeCharts() {
      for (let i = 0; i < this.sitesData.length; i++) {
        console.log(`#chart${i}`);
        
        const chartElement = document.querySelector(`#chart${i}`);
        console.log('Chart Element:', chartElement);
        
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
    
          console.log('Chart Options:', chartOptions);
    
          const chart = new ApexCharts(chartElement, chartOptions);
          chart.render()
            .then(() => console.log(`Chart ${i} rendered successfully.`))
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
  }

