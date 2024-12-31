import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [MatInputModule,NgApexchartsModule],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit, AfterViewInit {
  @Output() closeDrawer = new EventEmitter<boolean>();
  sitesData: any = [
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' }]
    options: any;
  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  }
  ngOnInit(): void {
    this.sitesData = [
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' }]
      
  }
  constructor(){
    this.options = {
      series: [
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
        {
          name: '',
          data: this.generateData(20, { min: -30, max: 55 }),
        },
      ],
      chart: {
        height: 105,
        width: '263px',
        type: 'heatmap',
        toolbar: {
          show: false, // Hides the toolbar (includes + and - icons)
        },
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 0,
          useFillColorAsStroke: true,
          columnWidth: '21px', // Width of each column (adjust as needed)
          rowHeight: '21px',
          colorScale: {
            ranges: [
              {
                from: -30,
                to: 5,
                name: 'low',
                color: '#00A100',
              },
              {
                from: 6,
                to: 20,
                name: 'medium',
                color: '#128FD9',
              },
              {
                from: 21,
                to: 45,
                name: 'high',
                color: '#FFB200',
              },
              {
                from: 46,
                to: 55,
                name: 'extreme',
                color: '#FF0000',
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
        show: false, // Hides the legend
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
      
    };
  }
    ngAfterViewInit(): void {
      this.initializeCharts();
    }
  
    initializeCharts() {
      // Loop through each site and initialize the chart
      for (let i = 0; i < this.sitesData.length; i++) {
        const chartElement = document.querySelector(`#chart${i}`); // Use the unique ID for each chart container
        if (chartElement && !chartElement.hasChildNodes()) {
          const chart = new ApexCharts(chartElement, this.options); // Initialize chart for each div
          chart.render();
        }
      }
    }
  
    generateData(count: number, range: { min: number, max: number }) {
      return Array.from({ length: count }, () => Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
    }
  }

