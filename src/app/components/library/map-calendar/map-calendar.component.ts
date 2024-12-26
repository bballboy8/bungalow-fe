import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import dayjs from "dayjs";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { SharedService } from "../../shared/shared.service";
import { SatelliteService } from "../../../services/satellite.service";

@Component({
  selector: "app-map-calendar",
  standalone: true,
  imports: [NgxDaterangepickerMd],
  templateUrl: "./map-calendar.component.html",
  styleUrl: "./map-calendar.component.scss",
})
export class MapCalendarComponent implements OnInit {
  startDate: dayjs.Dayjs = dayjs(); // Initialize with current date
  endDate: dayjs.Dayjs = dayjs().add(0, "days"); // Initialize with 1 day later
  maxDate: dayjs.Dayjs = dayjs();
  @Input() polygon_wkt:any
  constructor(private sharedService:SharedService,
    private satelliteService:SatelliteService
  ){}

  ngOnInit(): void {
    console.log(this.polygon_wkt,'inputting polygoninputting polygoninputting polygoninputting polygon');
    if(this.polygon_wkt){
      const payload = {
        polygon_wkt: this.polygon_wkt
      }
      this.satelliteService.getPolygonCalenderDays(payload).subscribe({
        next: (resp) => {
          console.log(resp,'getPolygonCalenderDaysgetPolygonCalenderDaysgetPolygonCalenderDays');
          
        }})
    }
    
  }
  choosedDate(event: any) {
    console.log("Selected Date and Time Range:", event);
  }

  closeEventCalendar(){
    this.sharedService.setIsOpenedEventCalendar(false);
  }

  calendarsData = [
    { month: "September" },
    { month: "August" },
    { month: "October" },
    { month: "January" },
  ];
}
