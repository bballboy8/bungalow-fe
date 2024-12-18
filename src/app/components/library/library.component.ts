import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { TemplateRef } from "@angular/core";
import { ViewChild } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { MatDialog } from "@angular/material/dialog";
import { ImagePreviewComponent } from "../../dailogs/image-preview/image-preview.component";
import { SharedService } from "../shared/shared.service";
import { SatelliteService } from "../../services/satellite.service";
import dayjs from "dayjs";

export class Group {
  name?: string;
  icon?: string; // icon name for Angular Material icons
  children?: Group[]; // nested groups
}

export interface PeriodicElement {
  select: boolean;
  Date: string;
  time: string;
  Sensor: string;
  Vendor: string;
  Cover: string;
  Resolution: string;
  type: string;
  Id: string;
  sun_elevation: string;
  area: number;
  geo_reference: boolean;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    select: false,
    Date: "09-18-2024",
    time: "02:44 UTC",
    Sensor: "Global-4",
    Vendor: "Vendor name",
    Cover: "1%",
    Resolution: "1.1m",
    type: "Type A",
    area: 23,
    geo_reference: true,
    Id: "bDUZAoGweYKcT5nU7piualQesdfSYo0lkdY",
    sun_elevation: "48.6",
  },
  {
    select: false,
    Date: "09-18-2024",
    time: "02:44 UTC",
    Sensor: "Global-4",
    Vendor: "Vendor name",
    Cover: "1%",
    Resolution: "1.1m",
    type: "Type A",
    area: 23,
    geo_reference: true,
    Id: "bDUZAoGwsadfcT5nU7piualQesdfSYo0lkdY",
    sun_elevation: "48.6",
  },
  {
    select: false,
    Date: "09-18-2024",
    time: "02:44 UTC",
    Sensor: "Global-4",
    Vendor: "Vendor name",
    Cover: "1%",
    Resolution: "1.1m",
    type: "Type A",
    area: 23,
    geo_reference: true,
    Id: "bDUZAoGweYKcT5nU7piusdfdsdfSYo0lkdY",
    sun_elevation: "48.6",
  },
  {
    select: false,
    Date: "09-18-2024",
    time: "02:44 UTC",
    Sensor: "Global-4",
    Vendor: "Vendor name",
    Cover: "1%",
    Resolution: "1.1m",
    type: "Type A",
    area: 23,
    geo_reference: true,
    Id: "bDUZAoGweYKcT5sdfsdfpiualQesdfSYo0lkdY",
    sun_elevation: "48.6",
  },
];

@Component({
  selector: "app-library",
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class LibraryComponent implements OnInit {
  //#region Decorators
  @ViewChild("myTemplate", { static: true }) myTemplate!: TemplateRef<any>;
  @Output() closeDrawer = new EventEmitter<boolean>();
  @Input() polygon_wkt:any;
  //#endregion

  //#region variables
  renderGroup!: TemplateRef<any> | null;
  checked: boolean = false;
  analyticsData:any = null;
  groups: Group[] = [
    { name: "Group name", icon: "folder", children: [] },
    {
      name: "Group name",
      icon: "folder",
      children: [
        { name: "Subgroup name", icon: "folder_open", children: [] },
        { name: "Another subgroup", icon: "folder", children: [] },
      ],
    },
  ];

  expandedElement: PeriodicElement | null = null;
  dataSource :any=[];
  displayedColumns: string[] = [
    "selectDate",
    "Sensor",
    "Vendor",
    "Cover",
    "Resolution",
    "type",
    "Id",
  ];

  selection = new SelectionModel<PeriodicElement>(true, []);

  fillLevels = [
    { duration: "24 Hours", value: 40, trend: "up" },
    { duration: "72 Hours", value: 60, trend: "up" },
    { duration: "7 Days", value: 30, trend: "up" },
    { duration: "30 Days", value: 10, trend: "up" },
    { duration: "90 Days", value: 5, trend: "down" },
    { duration: ">90 Days", value: 20, trend: "up" },
  ];

  browseItem: { date: string; time: string }[] = [
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
    { date: "9/18/2024", time: "02:44 UTC" },
  ];

  viewType: "table" | "browse" = "table";
  isEventsOpened: boolean = false;
  percentageArray:any
  imageHover:any ; 
  //#endregion

  constructor(
    private dialog: MatDialog,
    private sharedService: SharedService,
     private satelliteService:SatelliteService,
  ) {}

  ngOnInit() {
   
    
    this.renderGroup = this.myTemplate;
    // this.sharedService.isOpenedEventCalendar$.subscribe(resp=>this.isEventsOpened=resp)
    if(this.polygon_wkt){
      const data = { polygon_wkt: this.polygon_wkt };
      this.satelliteService.getPolygonSelectionAnalytics(data).subscribe({
        next: (res) => {
          console.log(res,'resresresresresresresresres');
          this.analyticsData = res?.data?.analytics
          this.percentageArray = Object.entries(this.analyticsData?.percentages).map(([key, value]) => ({
            key,
            ...(value as object),
          }));
        }
      })
      let queryParams ={
        page_number: '1',
        page_size: '100',
        start_date:'',
        end_date: '',
        source: 'library'
      }
     
      this.satelliteService.getDataFromPolygon('',queryParams).subscribe({
        next: (resp) => {
          console.log(resp,'queryParamsqueryParamsqueryParamsqueryParams');
          this.dataSource = resp.data
          
        },
        error: (err) => {
          console.log("err getPolyGonData: ", err);
        },
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  selectPreviewMethod(type: "table" | "browse") {
    this.viewType = type;
  }

  openImagePreviewDialog(item: any) {
    const dialogRef = this.dialog.open(ImagePreviewComponent, {
      width: "auto",
      data: { item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Selected date range:", result);
      }
    });
  }

  calendarEventsOpen() {
    this.isEventsOpened = !this.isEventsOpened;
    this.sharedService.setIsOpenedEventCalendar(this.isEventsOpened);
  }

  //calculate newest and oldest in days week months or year
  getHumanReadableDateDifference(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);
  
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
    }
  }

  //Total Number formatting in human-readable format with suffixes like k (thousands), m (millions), b (billions), etc.
  formatNumber(totalCount: number): string {
    if (totalCount >= 1_000_000_000) {
      return `${(totalCount / 1_000_000_000).toFixed(1)}b`; // Billions
    } else if (totalCount >= 1_000_000) {
      return `${(totalCount / 1_000_000).toFixed(1)}m`; // Millions
    } else if (totalCount >= 1_000) {
      return `${(totalCount / 1_000).toFixed(1)}k`; // Thousands
    } else {
      return totalCount.toString(); // Less than 1,000
    }
  }

  getValue(value:any,total:any){
    return value *100 / total
  }

  getFormattedDate(date: Date): string {
      return dayjs(date).format('MM.DD.YYYY');
  }
  formatUtcTime(payload: string | Date): string {
    // If payload is a string, convert it to Date first
    const date = new Date(payload);
  
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date passed');
    }
  
    // Get the UTC hours and minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
    // Return formatted time in "HH:mm UTC" format
    return `${hours}:${minutes} UTC`;
  }
  imageHoverView(data:any){
    console.log(data,'datadatadatadatadatadata');
    
    this.imageHover = data
  }
  formatToThreeDecimalPlaces(value: string): string {
    // Check if the string ends with "m"
    if (!value.endsWith("m")) {
        throw new Error("Invalid input: Value must end with 'm'");
    }

    // Extract the numeric part and parse it as a float
    const numericPart = parseFloat(value.slice(0, -1));
    
    // Format the numeric part to 3 decimal places
    const formattedNumber = numericPart.toFixed(3);

    // Reattach the "m" unit and return
    return `${formattedNumber}m`;
}

}
