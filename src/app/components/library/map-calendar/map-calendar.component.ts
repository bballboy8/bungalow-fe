import { Component, EventEmitter, Output } from "@angular/core";
import dayjs from "dayjs";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { SharedService } from "../../shared/shared.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-map-calendar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./map-calendar.component.html",
  styleUrls: ["./map-calendar.component.scss"],
})
export class MapCalendarComponent {
  startDate: dayjs.Dayjs = dayjs(); // Initialize with current date
  endDate: dayjs.Dayjs = dayjs().add(0, "days"); // Initialize with current date
  maxDate: dayjs.Dayjs = dayjs();

  @Output() dateRangeSelected = new EventEmitter<{ start: dayjs.Dayjs; end: dayjs.Dayjs }>();

  constructor(private sharedService: SharedService) {}

  // Weekday labels (starting from Sunday)
  weekDays: string[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  // Dynamically populated calendar data
  calendarData: { name: string; weeks: { date: number; value: number }[][] }[] = [];

  // Sample event data for heatmap (you can replace this with API data or user inputs)
  events: { date: string; value: number }[] = [
    { date: "2024-08-01", value: 2 },
    { date: "2024-08-15", value: 5 },
    { date: "2024-09-07", value: 4 },
    { date: "2024-10-19", value: 7 },
  ];

  ngOnInit() {
    this.generateCalendarData();
  }

  // Handles the date selection
  choosedDate(event: any) {
    console.log("Selected Date and Time Range:", event);
    this.dateRangeSelected.emit({ start: dayjs(event.startDate), end: dayjs(event.endDate) });
  }

  // Close calendar event
  closeEventCalendar() {
    this.sharedService.setIsOpenedEventCalendar(false);
  }

  generateCalendarData() {
    const start = dayjs("2024-08-01");
    const end = dayjs("2024-10-31");
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "month")) {
      const month = {
        name: current.format("MMMM"),
        weeks: this.generateWeeksForMonth(current),
      };
      this.calendarData.push(month);
      current = current.add(1, "month");
    }
  }

  generateWeeksForMonth(month: dayjs.Dayjs) {
    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");

    const weeks: { date: number; value: number }[][] = [];
    let current = startOfMonth.startOf("week");

    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, "day")) {
      const week: { date: number; value: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const value =
          this.events.find((e) => dayjs(e.date).isSame(current, "day"))
            ?.value || 0;
        week.push({ date: current.date(), value });
        current = current.add(1, "day");
      }
      weeks.push(week);
    }

    return weeks;
  }

  getDayClass(day: { date: number; value: number }): string {
    if (day.value === 0) return '';
    if (day.value <= 2) return 'color-1';
    if (day.value <= 4) return 'color-2';
    if (day.value <= 6) return 'color-3';
    return 'color-4';
  }
}
