import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from "@angular/core";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { legends_calendar } from "../../shared/calrendar-range-colos";
dayjs.extend(minMax);

type CalendarDay = {
  date: string;
  value: number | null;
  colorValue: string;
  backgroundValue: string;
  rangeName: string 
};
type CalendarWeek = CalendarDay[];
type CalendarMonth = { name: string; weeks: CalendarWeek[] };

@Component({
  selector: "app-map-calendar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./map-calendar.component.html",
  styleUrls: ["./map-calendar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCalendarComponent implements OnInit {
  // @Input() calendarApiData: Record<string, number> = {};
  @Output() dateRangeSelected = new EventEmitter<{
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  }>();

  weekDays: string[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  calendarData: CalendarMonth[] = [];
  showCalendar: boolean = true;
  @Input() endDateCal:any
  @Input() startDateCal:any;
  hoveredRange: string | null = null;
  @Output() calendarEventsOpen = new EventEmitter();
  private _calendarApiData:any
  @Input()
  set calendarApiData(value: any) {
    if (value !== this._calendarApiData) {
      this._calendarApiData = value;
      this.generateCalendarData(this._calendarApiData);
      // Add logic to handle the updated value, e.g., validate the date range
    }
  }

  get calendarApiData(): any {
    return this._calendarApiData;
  };

  tooltipPosition: any = {};
  colorRanges = []
  ngOnInit(): void {
  }

  closeEventCalendar(): void {
    this.showCalendar = false;
    this.calendarEventsOpen.emit()
  }

     generateCalendarData(apiData: Record<string, number>): void {
        this.calendarData = [];
        const dates = Object.keys(apiData).map((date) => dayjs(date));
        if (dates.length === 0) return;
    
        const start = dayjs.min(dates)!;
        const end = dayjs.max(dates)!;
        const dataMap = new Map(Object.entries(apiData));
        let current = start;
    
        // Extract non-zero values for range calculation
        const values = Object.values(apiData).filter((v) => v > 0);
        const minValue = values.length ? Math.min(...values) : 1;
        const maxValue = values.length ? Math.max(...values) : 1;
    
        // Ensure values maintain two decimal places
        const formatNumber = (num: number) => parseFloat(num.toFixed(1));
    
        // If all values are 0, show "No Data"
        if (values.length === 0) {
            while (current.isBefore(end) || current.isSame(end, "month")) {
                const monthDays: CalendarDay[] = [];
                const monthStart = current.startOf("month");
                const monthEnd = current.endOf("month");
                let day = monthStart;
    
                while (day.isBefore(monthEnd) || day.isSame(monthEnd, "day")) {
                    const dateString = day.format("YYYY-MM-DD");
                    monthDays.push({
                        date: dateString,
                        value: 0,
                        colorValue: "#ffffff",
                        backgroundValue: "",
                        rangeName: "No Data",
                    });
                    day = day.add(1, "day");
                }
    
                this.calendarData.push({
                    name: current.format("MMMM YYYY"),
                    weeks: this.generateWeeksForMonth(monthDays),
                });
    
                current = current.add(1, "month");
            }
            return;
        }
    
        // Define color ranges, excluding 0
        if (minValue === maxValue) {
            this.colorRanges = [{ 
                name: `Range ${formatNumber(minValue)}-${formatNumber(maxValue)}`, 
                color: "#319a43", 
                start: 1, 
                end: formatNumber(maxValue) 
            }];
        } else {
            const stepSize = formatNumber((maxValue - minValue) / 3);
    
            this.colorRanges = [
                { name: "Minimum", color: "#70ed8b", start: Math.round(formatNumber(minValue)), end: Math.round(formatNumber(minValue + stepSize)) },
                { name: "Medium", color: "#319a43", start: Math.round(formatNumber(minValue + stepSize)), end: Math.round(formatNumber(minValue + 2 * stepSize)) },
                { name: "Maximum", color: "#ff0000", start: Math.round(formatNumber(minValue + 2 * stepSize)), end: formatNumber(maxValue) },
            ];
        }
    
        console.log(this.colorRanges, "colorRanges");
    
        // Function to get range data
        const getRangeData = (value: number): { color: string; range: string } => {
            if (value === 0) return { color: "", range: "No Data" };
    
            for (const range of this.colorRanges) {
                if (value >= range.start && value <= range.end) {
                    return { color: range.color, range: range.name };
                }
            }
            return { color: "#ff0000", range: "Maximum" };
        };
    
        // Iterate through months
        while (current.isBefore(end) || current.isSame(end, "month")) {
            const monthDays: CalendarDay[] = [];
            const monthStart = current.startOf("month");
            const monthEnd = current.endOf("month");
            let day = monthStart;
    
            while (day.isBefore(monthEnd) || day.isSame(monthEnd, "day")) {
                const dateString = day.format("YYYY-MM-DD");
                const value = dataMap.get(dateString) || 0;
                const formattedValue = formatNumber(value); // Ensure 2 decimal places
    
                const { color, range } = getRangeData(formattedValue);
    
                monthDays.push({
                    date: dateString,
                    value: formattedValue,
                    colorValue: "#ffffff",
                    backgroundValue: color,
                    rangeName: range,
                });
    
                day = day.add(1, "day");
            }
    
            this.calendarData.push({
                name: current.format("MMMM YYYY"),
                weeks: this.generateWeeksForMonth(monthDays),
            });
    
            current = current.add(1, "month");
        }
    }

  generateWeeksForMonth(monthDays: CalendarDay[]): CalendarWeek[] {
    const weeks: CalendarWeek[] = [];
    let week: CalendarWeek = [];
    monthDays.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    if (week.length) weeks.push(week);
    return weeks;
  }

  getRandomDarkColor(): string {
    // Generate random RGB values biased towards darker colors
    const red = Math.floor(Math.random() * 128); // Range: 0–127
    const green = Math.floor(Math.random() * 128); // Range: 0–127
    const blue = Math.floor(Math.random() * 128); // Range: 0–127
  
    // Convert to rgb format
    return `rgb(${red}, ${green}, ${blue})`;
  }

  getColor(value: number, data): string {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const mean = data.reduce((sum, v) => sum + v, 0) / data.length;

    // Special case: Only one value in the dataset
  if (min === max) {
    return `rgb(255, 0, 0)`; // Default to red for a single value
  }
  // Clamp the value to the range [min, max]
  const clampedValue = Math.min(Math.max(value, min), max);

  // Normalize value to a range of 0-1
  const normalized = (clampedValue - min) / (max - min);

  // Calculate red and green intensities
   const red = Math.round(255 * normalized);     // Red increases with the value
   const green = Math.round(255 * (1 - normalized)); // Green decreases with the value

  // Return the gradient color
  return `rgb(${red}, ${green}, 0)`;
//  // Clamp the value to the range [min, max]
//  const clampedValue = Math.min(Math.max(value, min), max);

//  // Map value to a 0-1 range
//  const normalized = (clampedValue - min) / (max - min);

//  // Calculate red and green intensities
//  const red = Math.round(255 * normalized);     // Red increases with the value
//  const green = Math.round(255 * (1 - normalized)); // Green decreases with the value

//  // Return the color in rgb format
//  return `rgb(${red}, ${green}, 0)`; // Blue is fixed at 0 for shades of red and green


    // if (value <= mean) {
    //   // Below or at the mean: Lighter red shades
    //   const normalized = (value - min) / (mean - min);
    //   const red = 255;
    //   const green = Math.round(255 * (1 - normalized));
    //   const blue = Math.round(255 * (1 - normalized));
    //   return `rgb(${red}, ${green}, ${blue})`;
    // } else {
    //   // Above the mean: Transition from red to green
    //   const normalized = (value - mean) / (max - mean);
    //   const red = Math.round(255 * (1 - normalized));
    //   const green = Math.round(255 * normalized);
    //   return `rgb(${red}, ${green}, 0)`;
    // }
  }
  
  // getColor(value: number): string {
  //   // Generate a random color for the text
  //   return this.getRandomDarkColor();
  // }
  
  getBackgroundColor(value: number): string {
    const matchedRange = legends_calendar.find(
      range => value >= range.min && value <= range.max
    );
    return matchedRange?.color; // Default to black if no match
  }
  getDate(month: string, day: any): string {
    // Create the full date string like '2024-12-01' by combining year, month, and day
    const fullDate = `${day.date}`;
    // Use dayjs to format the full date
    const formattedDate = dayjs(fullDate).format('MMMM DD YYYY');
    return fullDate;
  }

  getDayFromDate(fullDate: string): number {
    return dayjs(fullDate).date(); // Extracts the day of the month from the full date
  }


//Tooltip positioning functions  

calculateTooltipPosition(event: MouseEvent, day: any): void {
  const dayElement = event.currentTarget as HTMLElement;
  const dayRect = dayElement.getBoundingClientRect();
  const tooltipWidth = 185; // Match your tooltip's min-width
  const tooltipHeight = 100; // Approximate tooltip height

  // Horizontal positioning
  let left: number, right: number;
  if (dayRect.right + tooltipWidth <= window.innerWidth) {
    left = dayRect.right;
    right = undefined;
  } else if (dayRect.left - tooltipWidth >= 0) {
    left = dayRect.left - tooltipWidth;
    right = undefined;
  } else {
    left = Math.max(10, window.innerWidth - tooltipWidth - 10);
    right = undefined;
  }

  // Vertical positioning
  let top: number, bottom: number;
  if (dayRect.bottom + tooltipHeight <= window.innerHeight) {
    top = dayRect.bottom;
    bottom = undefined;
  } else {
    bottom = window.innerHeight - dayRect.top + 10;
    top = undefined;
  }

  this.tooltipPosition[day.date] = {
    position: 'fixed',
    left: left + 'px',
    top: top ? top + 'px' : 'unset',
    bottom: bottom ? bottom + 'px' : 'unset',
    'z-index': 9999999999,
    // Include other styles from your original class
  };
}

clearTooltipPosition(day: any): void {
  delete this.tooltipPosition[day.date];
}
}
