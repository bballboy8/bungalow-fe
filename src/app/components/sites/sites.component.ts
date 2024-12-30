import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [MatInputModule],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit {
  @Output() closeDrawer = new EventEmitter<boolean>();
  sitesData: any = [
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
    { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' }]
  closeLibraryDrawer() {
    this.closeDrawer.emit(true);
  }
  ngOnInit(): void {
    this.sitesData = [
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'polygon', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' },
      { name: 'Selection name', type: 'square', frequency: '2 days', mostRecent: '1 day', gap: '2 days', recentAquization: '16 min', recentClear: '25 min' }]
  }
}
