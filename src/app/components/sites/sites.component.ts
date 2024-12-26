import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent {
@Output() closeDrawer = new EventEmitter<boolean>();

closeLibraryDrawer() {
  this.closeDrawer.emit(true);
}
}
