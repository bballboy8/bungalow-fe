import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GroupsListComponent } from '../../common/groups-list/groups-list.component';
import { SatelliteService } from '../../services/satellite.service';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, of, Subject, switchMap } from 'rxjs';

export class Group {
  name?: string;
  icon?: string; // icon name for Angular Material icons
  children?: Group[]; // nested groups
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule,GroupsListComponent,MatInputModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent implements OnInit {
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
  activeGroup:any;
  @Output() closeDrawer = new EventEmitter<boolean>();
    searchInput = new Subject<string>();
  constructor(
    private satelliteService:SatelliteService,
  ){
     this.searchInput.pipe(
          debounceTime(1000),  // Wait for 1000ms after the last key press
          switchMap((inputValue) => {
            const data = {
              group_name:inputValue
            }
            
            return this.satelliteService.getGroupsForAssignment(data).pipe(
              catchError((err) => {
                
                console.error('API error:', err);
                // Return an empty array to allow subsequent API calls to be made
                return of({ data: [] });
              })
            );
          })
        ).subscribe({
          next: (resp: any) => {
            
            console.log(resp, 'API Response');
            this.groups = resp?.data;
          },
          error: (err: any) => {
            console.error('API call failed', err);
          }
        });
  }

  ngOnInit(): void {
    this.getGroups()
  }

  getGroups() {
    this.selectedGroupEvent(null)
    
      const data = {
        group_name: ''
      }
      this.satelliteService.getGroupsForAssignment(data).subscribe({
        next: (resp) => {
          console.log(resp, 'respresprespresprespresprespresprespresp');
          this.groups = resp
  
        }
      })
    
  
  }
  selectedGroupEvent(event: any) {
    console.log(event, 'selectedeventeventeventevent');
    this.activeGroup = event
  }

  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  
  }

   //On Keypress filter groups data
   onKeyPress(event: KeyboardEvent): void {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(inputValue, 'inputValueinputValueinputValue'); // Log the current input value to the console

    // this.satelliteService.getGroupsForAssignment(data).subscribe({
    //   next: (resp) => {
    //     console.log(resp,'respresprespresprespresprespresprespresp');

    //     this.groups = resp?.data

    //   }})
    console.log(this.searchInput, 'searchiiiiiiiiiiiiiiiii');

    this.searchInput.next(inputValue);
  }
}
