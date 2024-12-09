import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TemplateRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

export class Group {
  name?: string;
  icon?: string; // icon name for Angular Material icons
  children?: Group[]; // nested groups
}

export interface PeriodicElement {
  select: boolean;
  Date: string;
  Sensor: string;
  Vendor: string;
  Cover: string;
  Resolution: string;
  type: string;
  Id: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    select: false,
    Date: '2024-12-01',
    Sensor: 'Thermal',
    Vendor: 'Vendor A',
    Cover: 'Metal',
    Resolution: '1080p',
    type: 'Type A',
    Id: 1,
  },
  {
    select: false,
    Date: '2024-12-02',
    Sensor: 'Optical',
    Vendor: 'Vendor B',
    Cover: 'Plastic',
    Resolution: '720p',
    type: 'Type B',
    Id: 2,
  },
  {
    select: false,
    Date: '2024-12-03',
    Sensor: 'Infrared',
    Vendor: 'Vendor C',
    Cover: 'Glass',
    Resolution: '4K',
    type: 'Type C',
    Id: 3,
  },
  {
    select: false,
    Date: '2024-12-04',
    Sensor: 'Ultrasonic',
    Vendor: 'Vendor D',
    Cover: 'Ceramic',
    Resolution: '8K',
    type: 'Type D',
    Id: 4,
  },
];



@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule,MatProgressBarModule, MatMenuModule,MatFormFieldModule,ReactiveFormsModule,FormsModule,MatButtonModule,MatInputModule,MatCheckboxModule,MatListModule,MatIconModule,MatTableModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent {

  @ViewChild('myTemplate', { static: true }) myTemplate!: TemplateRef<any>;

  @Output() closeDrawer=new EventEmitter<boolean>();
  renderGroup!: TemplateRef<any> | null;
  checked:boolean = false;
  groups: Group[] = [
    { name: 'Group name', icon: 'folder', children: [] },
    { 
      name: 'Group name', 
      icon: 'folder', 
      children: [
        { name: 'Subgroup name', icon: 'folder_open', children: [] },
        { name: 'Another subgroup', icon: 'folder', children: [] },
      ]
    },
    // Add more groups as needed
  ];

  fillLevels = [
    { duration: '24 Hours', value: 40, trend: 'up'},
    { duration: '72 Hours', value: 60, trend: 'up'},
    { duration: '7 Days', value: 30, trend: 'up'},
    { duration: '30 Days', value: 10, trend: 'up'},
    { duration: '90 Days', value: 5, trend: 'down'},
    { duration: '>90 Days', value: 20, trend: 'up'}
  ];

  statsInfo = [
    { label: 'Oldest', value: '2 days',color:'text-secondaryText' },
    { label: 'Newest', value: '1 day',color:'text-secondaryText' },
    { label: 'Total', value: '8.6k',color:'text-secondaryText' },
    { label: 'Avg', value: '34',color:'text-secondaryText' },
    { label: 'Most recent', value: '16 min',color:'!text-yellow' },
    { label: 'Most recent clear', value: '25 min',color:'!text-yellow' },
  ];

  ngOnInit() {
    // Assign the template to renderGroup
    this.renderGroup = this.myTemplate;
  }




  // table 
  displayedColumns: string[] = ['selectDate', 'Sensor', 'Vendor', 'Cover', 'Resolution', 'type', 'Id'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  closeLibraryDrawer(){
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.Id + 1}`;
  }

}
