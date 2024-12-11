import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
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

  //#endregion

  //#region variables
  renderGroup!: TemplateRef<any> | null;
  checked: boolean = false;
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
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
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

  statsInfo = [
    { label: "Oldest", value: "2 days", color: "text-secondaryText" },
    { label: "Newest", value: "1 day", color: "text-secondaryText" },
    { label: "Total", value: "8.6k", color: "text-secondaryText" },
    { label: "Avg", value: "34", color: "text-secondaryText" },
    { label: "Most recent", value: "16 min", color: "!text-yellow" },
    { label: "Most recent clear", value: "25 min", color: "!text-yellow" },
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

  //#endregion

  constructor(
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.renderGroup = this.myTemplate;
    this.sharedService.isOpenedEventCalendar$.subscribe(resp=>this.isEventsOpened=resp)
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

  openImagePreviewDialog(item: { date: string; time: string }) {
    const dialogRef = this.dialog.open(ImagePreviewComponent, {
      width: "auto",
      data: { item, image: "assets/svg-icons/map-dialog-image.svg" },
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
}
