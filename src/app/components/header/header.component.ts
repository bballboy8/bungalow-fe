import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() toggleDrawer?: () => void;
  @Output() toggleEvent = new EventEmitter<string>();
  @Output() searchEvent = new EventEmitter<string>();

  searchQuery: string = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchEvent.emit(this.searchQuery);  // Emit the search query to the parent
    }
  }
  onToggleDrawer(type:string) {
    if (this.toggleDrawer) {
      this.toggleDrawer();
      this.toggleEvent.emit(type);
    }
  }
}
