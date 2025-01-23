import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, input, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { CommonDailogsComponent } from '../../dailogs/common-dailogs/common-dailogs.component';
import { SatelliteService } from '../../services/satellite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../components/shared/shared.service';
@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, DateFormatPipe, MatMenuModule],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.scss'
})
export class GroupsListComponent implements AfterViewInit {
  @Input() group: any; // Current group data
  isExpanded = false; // Tracks expand/collapse state
  @Input() backgroundColor: string = '#191E22';
  @Input() index: any
  activeIndex: any;
  @Output() selectedGroup = new EventEmitter<{}>();
  @Input() type: string = ''
  @Input() padding: string = '';
  private _snackBar = inject(MatSnackBar);
  site_objects_count:any
  constructor(private overlayContainer: OverlayContainer,
    private dialog: MatDialog,
    private satelliteService:SatelliteService,
    private SharedService: SharedService
  ) { 
  }

  ngAfterViewInit(): void {
    this.SharedService.nestedPadding$.subscribe((value)=> {
      console.log(value,'valuevaluevaluevaluevaluevaluevaluevaluevaluevalue');
      if(value) this.padding = value  
      
    })
  }

  toggle(group: any) {
    
    if (group !== this.activeIndex) {
      this.activeIndex = group
     const newPadding = parseInt(this.padding) +15

      this.SharedService.setNestedPadding(newPadding.toString())
    } else {
      const newPadding = parseInt(this.padding) - 15

      this.SharedService.setNestedPadding(newPadding.toString()) 
      this.activeIndex = null;
    }
    this.isExpanded = !this.isExpanded; // Toggle expand/collapse
    this.backgroundColor = this.isExpanded ? '#232B32' : '#191E22';
    if (this.isExpanded) {
      this.selectedGroup.emit({ group })
    }
  }

  setClass() {
    const containerElement = this.overlayContainer.getContainerElement();
    containerElement.classList.add('group-overlay-container');

  }

  addGroup(type: string, group: any) {
    let data
    if (type == 'addGroup') {
      data = { type: type }
    } else {
      data = { type: type, parent: group.id}
    }

    console.log(group, 'sssssssssssssssssss');

    this.openDialog(data)
  }

  renameGroup(type: any, group: any) {
    const data = { type: type, group: group}
    this.openDialog(data)
  }

  deleteGroup(type: any, group: any) {
    const data = { type: type, group: group}
    this.openDialog(data)
  }

  setNotifications(status:boolean,group:any){
    const payload = {
      group_id: group.id,
      notification: status,
      name:group?.name
    }
    this.satelliteService.updateGroup(payload).subscribe({
      next: (resp) =>{
        this.SharedService.setNestedGroup(true);
      }
    })
  }

  openDialog(data: any) {
    const dialogRef = this.dialog.open(CommonDailogsComponent, {
      width: '350px',
      height: 'auto',
      data: data,
      panelClass: 'custom-dialog-class',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(' closed', result);
      if(result){
        this.SharedService.setNestedGroup(true);
      }
      
      this._snackBar.open('Group updated successfully.', 'Ok', {
        duration: 2000  // Snackbar will disappear after 300 milliseconds
      });
     
    });
  }
  // Round off value
  roundOff(value: number): any {
    return Math.round(value);
  }
}
