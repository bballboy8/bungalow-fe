import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { SatelliteService } from "../../services/satellite.service";
import { SharedService } from "../shared/shared.service";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import momentZone from "moment-timezone";
import { OverlayContainer } from "@angular/cdk/overlay";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
@Component({
  selector: "app-imagery-status",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
    NgxDaterangepickerMd,
  ],
  templateUrl: "./imagery-status.component.html",
  styleUrl: "./imagery-status.component.scss",
})
export class ImageryStatusComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>(/* your data source */);
  columns = [
    { id: "acquisition_datetime", displayName: "Date", visible: true },
    { id: "vendor_name", displayName: "Vendor", visible: true },
    { id: "successful", displayName: "Successful", visible: true },
    { id: "failed", displayName: "Failed", visible: true },
    { id: "total", displayName: "Total", visible: true },
  ];

  get displayedColumns(): string[] {
    return [
      ...this.columns.filter((c) => c.visible).map((c) => c.id), // Keep expand column always visible
    ];
  }
  total_count: any;
  @ViewChild(MatSort) sort!: MatSort;
  page_size = 100;
  perPageSize = 20;
  page_number = 1;
  loader: boolean = false;
  filterParams: any;
  @ViewChild("scrollableDiv") scrollableDiv!: ElementRef<HTMLDivElement>;
  sliderShow: boolean = false;
  filterCount: any = 0;
  formGroup: FormGroup;
  //Default Query parameters
  defaultFilter() {
    return {
      page_number: 1,
      page_size: 100,
    };
  }
  originalData: any[] = [];
  @ViewChild("menuFilterTrigger") menuFilterTrigger!: MatMenuTrigger;
  @Output() closeDrawer = new EventEmitter<boolean>();
  vendorsList: any[] = [
    "airbus",
    "blacksky",
    "capella",
    "maxar",
    "planet",
    "skyfi-umbra",
  ];
  maxDate: any = dayjs().utc();
  locale = {
    format: "YYYY-MM-DD HH:mm [UTC]", // Custom format with UTC label
    displayFormat: "YYYY-MM-DD HH:mm [UTC]",
  };
  start_date: any;
  end_date: any;
  constructor(
    private satelliteService: SatelliteService,
    private el: ElementRef,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private overlayContainer: OverlayContainer,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      vendor: [],
      start_date: [],
      end_date: [],
    });
    this.start_date = dayjs().utc();
    this.end_date = dayjs().utc();
  }

  ngOnInit(): void {
    console.log(this.maxDate, "sssssssssssssssss");
    this.maxDate = this.maxDate.format("YYYY-MM-DD HH:mm [UTC]");
    this.filterParams = { ...this.defaultFilter() };
    let queryParams = {
      ...this.filterParams,
      page_number: 1,
      page_size: this.page_size,
    };
    this.getImageryCollection(queryParams);
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      setTimeout(() => {
        this.setDynamicHeight();
        window.addEventListener("resize", this.setDynamicHeight.bind(this));
      }, 300);
    }
    this.dataSource.sort = this.sort;
    console.log(this.dataSource, "sortsortsortsortsort");
    const div = this.scrollableDiv?.nativeElement;

    // Add scroll event listener

    div.addEventListener("wheel", this.handleWheelEvent);
  }

  //Get Imagery Collection histroy data
  getImageryCollection(queryParams: any) {
    console.log(queryParams, "queryParamsqueryParamsqueryParamsqueryParams");

    this.satelliteService.getCollectionHistory(queryParams).subscribe({
      next: (resp) => {
        console.log(resp, "resprespresprespresprespresprespresprespresp");
        this.dataSource.data = resp.data.records.map((item, idx) => ({
          ...item,
          index: idx,
        }));
        this.originalData = [...this.dataSource.data];
        this.total_count = resp.data.total_records;
      },
    });
  }

  private canTriggerAction = true;
  private isAtBottom = false;

  //Scroll to bottom event
  private handleWheelEvent = (event: WheelEvent): void => {
    const div = this.scrollableDiv?.nativeElement;

    // Detect if at the bottom
    const isAtBottom =
      div.scrollTop + div.clientHeight + 150 >= div.scrollHeight;
    console.log(isAtBottom, "isAtBottomisAtBottomisAtBottom");

    // Only trigger if at the bottom and trying to scroll down
    if (isAtBottom && event.deltaY > 0 && this.canTriggerAction) {
      if (!this.isAtBottom) {
        this.isAtBottom = true; // Lock the event trigger
        let num = this.page_number;
        this.page_number = num + 1;
        if (this.dataSource.data.length < this.total_count) {
          let queryParams = {
            ...this.filterParams,
            page_number: this.page_number,
            page_size: this.page_size,
          };
          this.satelliteService.getCollectionHistory(queryParams).subscribe({
            next: (resp) => {
              const data = resp.data.records.map((item, idx) => ({
                ...item,
                index: idx,
              }));
              this.dataSource.data = this.dataSource.data.concat(data);
              this.originalData = [...this.dataSource.data];
            },
          });
          this.loader = true;
          // this.ngxLoader.start(); // Start the loader
        }
        setTimeout(() => {
          this.setDynamicHeight();
          window.addEventListener("resize", this.setDynamicHeight.bind(this));
        }, 300);
        // Set debounce flag to false and reset it after 3 seconds
        this.canTriggerAction = false;
        setTimeout(() => {
          this.canTriggerAction = true;
          this.isAtBottom = false; // Reset at bottom flag
        }, 3000); // 3 seconds delay
      }
    }
  };

  //Setting Dynamic Height
  setDynamicHeight(): void {
    // Get the height of the elements above

    const header = document.getElementById("header");

    // Calculate the total height of all the above elements
    const totalHeight = [header].reduce(
      (acc, el) => acc + (el ? el.offsetHeight : 0),
      0
    );

    // Get the height of the viewport
    const viewportHeight = window.innerHeight;
    console.log("viewportHeightviewportHeightviewportHeight", totalHeight);

    // Calculate the remaining height for the target div
    const remainingHeight = viewportHeight - totalHeight - 126;

    // Get the content div and apply the calculated height
    const contentDiv = this.el.nativeElement.querySelector(".content");

    if (contentDiv) {
      this.renderer.setStyle(contentDiv, "height", `${remainingHeight}px`);
    }
  }
  ngOnDestroy(): void {
    window.removeEventListener("resize", this.setDynamicHeight.bind(this)); // Clean up event listener
    const div = this.scrollableDiv?.nativeElement;
    // Remove all listeners to avoid memory leaks
  }

  //Close library drawer functionality

  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
    this.sharedService.setIsOpenedEventCalendar(false);
  }

  //Table On sort direction functionality
  onSortChange(event: { active: string; direction: string }) {
    this.sortData();
  }

  //Table data sorting functions
  sortData() {
    const activeColumn = this.sort.active;
    const direction = this.sort.direction;

    if (!activeColumn || direction === "") {
      return;
    }

    console.log(
      activeColumn,
      "activeColumnactiveColumnactiveColumn",
      direction
    );

    let queryParams: any = this.filterParams;

    if (activeColumn) {
      queryParams = {
        ...queryParams,
        sort_by: activeColumn,
        sort_order: direction,
      };
    }
    this.loader = true;
    // this.ngxLoader.start(); // Start the loader
    this.getImageryCollection(queryParams);
  }
  getFormattedDate(date: Date, centroid?: [number, number]): string {
    // Format date in UTC
    return momentZone(date).utc().format("YYYY-MM-DD");
  }

  //Format time in UTC fucntionality
  formatUtcTime(payload) {
    // Check if payload contains valid acquisition_datetime
    if (!payload?.created_at) {
      throw new Error("Invalid payload or acquisition_datetime missing");
    }

    const date = new Date(payload.created_at);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date passed");
    }

    return momentZone.utc(date).format("HH:mm [UTC]");
  }
  //Menu close
  onMenuClose() {
    this.sliderShow = false;
  }
  //Set filter menu class
  setFilterClass() {
    const containerElement = this.overlayContainer.getContainerElement();
    // Remove existing class before adding a new one
    const classesToRemove = [
      "column-menu",
      "library-overlay-container",
      "site-menu",
      "custom-menu-container",
      "group-overlay-container",
      "filter-overlay-container",
    ];
    containerElement.classList.remove(...classesToRemove);
    containerElement.classList.add("imagery-filter-container");
    containerElement.addEventListener("click", (event: Event) => {
      event.stopPropagation();
    });
  }
  //Form Submit filter functionality
  onSubmit() {
    // this.updateFilterCount();

    // const datetime = this.formGroup.value.end_date;
    // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(
      this.start_date,
      "start_datestart_datestart_datestart_datestart_datestart_date",
      this.end_date
    );

    let queryParams = {
      ...this.filterParams,
      // end_date:this.getDateValue(this.endDate),
      // start_date:this.getDateValue(this.startDate),
      vendor_name: this.formGroup.get("vendor")?.value
        ? this.formGroup.get("vendor").value?.join(",")
        : "",
    };

    const params = {
      ...queryParams,
      page_number: 1,
      page_size: 100,
    };

    this.filterParams = { ...this.filterParams, ...params };
    setTimeout(() => {
      this.loader = true;
      // this.ngxLoader.start(); // Start the loader
      this.getImageryCollection(params);
      this.closeFilterMenu();
    }, 300);
  }

  //Filter menu close button
  closeFilterMenu() {
    console.log("closseeeee", this.menuFilterTrigger);

    if (this.menuFilterTrigger) {
      this.menuFilterTrigger.closeMenu();
    }
  }
}
