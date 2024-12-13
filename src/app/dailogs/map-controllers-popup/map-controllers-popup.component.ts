import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import dayjs from 'dayjs';
import { SatelliteService } from '../../services/satellite.service';

export class Group {
  name?: string;
  icon?: string; // icon name for Angular Material icons
  children?: Group[]; // nested groups
}

@Component({
  selector: 'app-map-controllers-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './map-controllers-popup.component.html',
  styleUrls: ['./map-controllers-popup.component.scss']
})
export class MapControllersPopupComponent implements OnInit {
  @ViewChild('myTemplate', { static: true }) myTemplate!: TemplateRef<any>;
  selectedTimeFrame: string = '1';
  renderGroup!: TemplateRef<any> | null;
  checked: boolean = false;
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private satelliteService:SatelliteService,) {}

  ngOnInit(): void {
    console.log(this.data, 'datataatatatatatattat');
    this.renderGroup = this.myTemplate;
  }

  activeTimeFrame(time: string) {
    this.selectedTimeFrame = time;
  }

  formatDate(date: any) {
    return dayjs(date).format('DD.MM.YY');
  }

  getGroups(){
    const data = {
      group_name:''
    }
    this.satelliteService.getGroupsForAssignment(data).subscribe({
      next: (resp) => {
        console.log(resp,'successsuccesssuccess');
        
      }})
  }
}
