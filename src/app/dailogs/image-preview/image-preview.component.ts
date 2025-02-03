import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import dayjs from "dayjs";
import { DateFormatPipe, TimeFormatPipe } from "../../pipes/date-format.pipe";

@Component({
  selector: "app-image-preview",
  standalone: true,
  imports: [CommonModule,DateFormatPipe,TimeFormatPipe],
  templateUrl: "./image-preview.component.html",
  styleUrl: "./image-preview.component.scss",
})
export class ImagePreviewComponent implements OnInit,AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ImagePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  currentIndex:any;
  // isZoomed = false;
//  isDragging = false;
  zoomLevel: number = 1; // Initial zoom level
  isDragging: boolean = false; // Dragging state
  startX: number = 0; // Mouse start X
  startY: number = 0; // Mouse start Y
  offsetX: number = 0; // Image offset X
  offsetY: number = 0; // Image offset Y
  tempOffsetX: number = 0; // Temporary offset during drag
  tempOffsetY: number = 0; // Temporary offset during drag
  isZoomed: boolean = false; // Zoom toggle state

  @ViewChild("img", { static: false }) img!: ElementRef;

  @ViewChild('container') 'container': ElementRef;
  // @ViewChild('img') 'img': ElementRef;
  ngOnInit(): void {
    this.currentIndex = this.data?.currentIndex;
    console.log("dialog dat: ", this.data);
  }

  ngAfterViewInit() {
    // this.adjustImageHeight();
    if (!this.img) {
      console.error("Image element not found");
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
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
    previousImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        const imgElement = this.img.nativeElement;
        imgElement.style.transform = 'scale(1)';
      } else {
        this.currentIndex = this.data.images.data.length - 1; // Wrap around to the last image
      }
    }
  
    nextImage() {
      if (this.currentIndex < this.data.images.data.length - 1) {
        this.currentIndex++;
        const imgElement = this.img.nativeElement;
        imgElement.style.transform = 'scale(1)';
      } else {
        this.currentIndex = 0; // Wrap around to the first image
      }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        this.previousImage(); // Call previousImage() on left arrow key press
      } else if (event.key === 'ArrowRight') {
        this.nextImage(); // Call nextImage() on right arrow key press
      }
    }

    onClick(event: MouseEvent): void {
      this.isZoomed = !this.isZoomed;
    
      const imgElement = this.img.nativeElement;
      const containerElement = this.container.nativeElement;
    
      if (this.isZoomed) {
        const rect = containerElement.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
    
        imgElement.style.transformOrigin = `${clickX}px ${clickY}px`;
        imgElement.style.transform = 'scale(3)';
      } else {
        imgElement.style.transform = 'scale(1)';
        this.resetDragState();
      }
    }
    
    // onMouseDown(event: MouseEvent): void {
    //   if (!this.isZoomed) return;
    
    //   this.isDragging = true;
    //   this.startX = event.clientX - this.offsetX;
    //   this.startY = event.clientY - this.offsetY;
    // }
    
    mouseMoveHandler(event: MouseEvent): void {
      if (!this.isDragging) return;
    
      const imgElement = this.img.nativeElement;
    
      this.offsetX = event.clientX - this.startX;
      this.offsetY = event.clientY - this.startY;
    
      imgElement.style.transform = `scale(3) translate(${this.offsetX}px, ${this.offsetY}px)`;
    }
    
    // onMouseUp(): void {
    //   this.isDragging = false;
    // }
    
    onMouseLeave(): void {
      if (!this.isZoomed) return;
      this.isDragging = false;
    }
    
    onMouseEnter(): void {
      // Re-enable dragging when mouse enters the container.
      if (this.isZoomed) this.isDragging = false;
    }
    
    // private resetDragState(): void {
    //   this.isDragging = false;
    //   this.offsetX = 0;
    //   this.offsetY = 0;
    // }

    // Round off value
    roundOff(value: number): any {
      return Math.round(value);
    }

    toDecimal(value:number){
    return value.toFixed(2);
    }

    //Getting time in Day sessions
    getTimePeriod(datetime: string): string {
      
      const utcDate = dayjs(datetime).utc();
  
      // Get the hour in UTC
      const hours = utcDate.hour();
    
      // Determine the time period based on the UTC hour
      if (hours >= 5 && hours < 11) {
        return "Morning";
      } else if (hours >= 11 && hours < 16) {
        return "Midday";
      } else if (hours >= 16 && hours < 21) {
        return "Evening";
      } else {
        return "Overnight";
      }
    }

    // adjustImageHeight() {
    //   const dialogContainer = document.querySelector('.dialog-content');
    //   const image = document.querySelector('.resizable-image') as HTMLImageElement;
    //   console.log(dialogContainer?.clientHeight,'dialogContainer.clientHeightdialogContainer.clientHeight');
      
    //   if (dialogContainer && image) {
    //     const dialogHeight = dialogContainer.clientHeight;
    //     image.style.height = `${dialogHeight}px`; // Adjust the image height to match the dialog height
    //   }
    // }

     // Handle mouse wheel zoom
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const delta = event.deltaY < 0 ? 1 : -1;
    this.zoomLevel = Math.max(1, this.zoomLevel + delta * zoomSpeed);
    this.applyTransform();
  }

  // Handle drag start
  onMouseDown(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.offsetX;
      this.startY = event.clientY - this.offsetY;
    }
  }

  // Handle drag move
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.offsetX = event.clientX - this.startX;
      this.offsetY = event.clientY - this.startY;
      this.applyTransform();
    }
  }

  // Handle drag end
  onMouseUp(): void {
    this.isDragging = false;
  }

  // Apply transformations for zoom and drag
  private applyTransform(): void {
    const imgElement = this.img.nativeElement as HTMLImageElement;
    imgElement.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.zoomLevel})`;
    imgElement.style.cursor = this.zoomLevel > 1 ? "grab" : "grab";
  }

  // Reset drag state when zoom is toggled off
  private resetDragState(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.applyTransform();
  }
}
