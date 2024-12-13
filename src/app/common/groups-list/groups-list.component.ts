import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule,MatExpansionModule],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.scss'
})
export class GroupsListComponent {
  @Input() group: any; // Current group data
  isExpanded = false; // Tracks expand/collapse state
  @Input() backgroundColor: string = '#191E22';
  @Input() index:any
  activeIndex: any;
  toggle() {
    
    if(this.index !== undefined){
      this.activeIndex = this.index
    }
    this.isExpanded = !this.isExpanded; // Toggle expand/collapse
    this.backgroundColor = this.isExpanded ? '#232B32' : '#191E22';
  }
}
