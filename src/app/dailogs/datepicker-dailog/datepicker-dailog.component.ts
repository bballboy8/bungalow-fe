import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateAdapter, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../customFIles/cutom-adaptor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import moment from 'moment'; 
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();
@Component({
  selector: 'app-datepicker-dailog',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatNativeDateModule,
    MatButtonModule,
    MatFormFieldModule,
    NgxDaterangepickerMd
    

  ],
  providers: [],
  templateUrl: './datepicker-dailog.component.html',
  styleUrl: './datepicker-dailog.component.scss'
})

export class DatepickerDailogComponent implements OnInit,AfterViewInit  {
  @Input() startDate: dayjs.Dayjs = dayjs(); // Initialize with current date
  @Input() endDate: dayjs.Dayjs = dayjs().add(0, 'days'); // Initialize with 1 day later
  selectedDate: Date | null = null; // Initialize with today's date
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  maxDate:dayjs.Dayjs = dayjs();
  isSelectingStart = true;
  currentUtcTime:dayjs.Dayjs = dayjs().utc();
  @ViewChild('startDateInput') startDateInput!: ElementRef<HTMLInputElement>;
  ngOnInit(): void {
    console.log(this.data,'sssssssssssssssss');
    
    if(this.data.startDate && this.data.endDate){
      this.startDate = dayjs(this.data.startDate);
      this.endDate = dayjs(this.data.endDate);
      console.log(this.startDate,'this.startDatethis.startDatethis.startDate');
      
    } else {
      this.startDate = dayjs(); 
      this.endDate = dayjs().add(0, 'days');
    }
  }
  dateRangeForm: FormGroup;
  onSubmit() {
    console.log('Selected Date Range:', this.dateRangeForm.value.dateRange);
  }

  constructor(public dialogRef: MatDialogRef<DatepickerDailogComponent>,private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dateRangeForm = this.fb.group({
      dateRange: [''],  // Bind this to the date range picker
    });
  }
  ngAfterViewInit(): void {
    
  }
  // This method will be triggered when a date range is selected
  choosedDate(event: any) {
    console.log('Selected Date and Time Range:', event);

    if (event && event.startDate && event.endDate) {
      // Convert the selected startDate and endDate to UTC Dayjs objects
      this.startDate = dayjs(event.startDate).utc();
      this.endDate = dayjs(event.endDate).utc();
  
      // Get the current UTC time in HH:mm UTC format
      //  this.currentUtcTime = dayjs().utc().format('HH:mm [UTC]');
      console.log('Start Date in UTC:', this.startDate.format('MM.DD.YYYY HH:mm [UTC]'));
      console.log('End Date in UTC:', this.endDate.format('MM.DD.YYYY HH:mm [UTC]'));
      console.log('Current UTC Time:', this.currentUtcTime);
  
      // Optional: Automatically apply the date range
      this.autoApplyDateRange();
    }
  }

  autoApplyDateRange() {
    console.log('Auto Applying Date Range with Time:', this.startDate.format('MM.DD.YYYY'), this.endDate.format('MM.DD.YYYY'));
    if (this.startDateInput && this.startDateInput.nativeElement) {
      this.startDateInput.nativeElement.click();
    }
  }
  // Helper method to format the date as MM.DD.YYYY
  formatDate(date: any): string {
    const month = (date.month() + 1).toString().padStart(2, '0'); // Add leading zero for single digits
    const day = date.date().toString().padStart(2, '0'); // Add leading zero for single digits
    const year = date.year();

    return `${month}.${day}.${year}`;
  }

  // Optionally, this method can be used to apply the selected date range



  // Function to set the date range based on button clicked
setDateRange(range: string): void {
  const now = dayjs().utc(); // Get current UTC time as a Dayjs object

  switch (range) {
    case '24hours':
      this.startDate = now.subtract(1, 'day'); // 1 day before (UTC)
      this.endDate = now; // Now (UTC)
      break;
    case '3days':
      this.startDate = now.subtract(3, 'days');
      this.endDate = now;
      break;
    case '7days':
      this.startDate = now.subtract(7, 'days');
      this.endDate = now;
      break;
    case '14days':
      this.startDate = now.subtract(14, 'days');
      this.endDate = now;
      break;
    case '28days':
      this.startDate = now.subtract(28, 'days');
      this.endDate = now;
      break;
    case '3months':
      this.startDate = now.subtract(3, 'months');
      this.endDate = now;
      break;
    case '6months':
      this.startDate = now.subtract(6, 'months');
      this.endDate = now;
      break;
    case '9months':
      this.startDate = now.subtract(9, 'months');
      this.endDate = now;
      break;
    default:
      console.error('Invalid range');
      break;
  }
  setTimeout(() => {
    this.autoApplyDateRange();
  }, 10);
  // Ensure startDate and endDate are Dayjs objects in UTC format
  this.startDate = dayjs(this.startDate).utc();
  this.endDate = dayjs(this.endDate).utc();

  // Log to check the result
  
  console.log('Start Date in UTC:', this.startDate.format('YYYY-MM-DD HH:mm [UTC]'));
  console.log('End Date in UTC:', this.endDate.format('YYYY-MM-DD HH:mm [UTC]'));

  // Optionally, trigger auto-apply of the date range
   // Delay for 1 second (1000 ms)
}

  

  // selectPreset(days: number): void {
  //   const now = new Date();
  //   this.endDate = now;
  //   this.startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  // }

  applyDateRange(): void {
    // console.log('Start Date:', this.startDate);
    // console.log('End Date:', this.endDate);

    // Pass only valid dates back to the parent component
    if (this.startDate && this.endDate) {
      this.dialogRef.close({ startDate: this.startDate, endDate: this.endDate,currentUtcTime:this.currentUtcTime });
    } else {
      this.dialogRef.close(null); // Close without returning if dates are invalid
    }
  }


  
}
