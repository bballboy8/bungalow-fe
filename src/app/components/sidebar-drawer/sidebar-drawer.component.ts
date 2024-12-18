import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LibraryComponent } from "../library/library.component";

@Component({
  selector: "app-sidebar-drawer",
  standalone: true,
  imports: [LibraryComponent],
  templateUrl: "./sidebar-drawer.component.html",
  styleUrl: "./sidebar-drawer.component.scss",
})
export class SidebarDrawerComponent {
  @Input() type: string = "";
  @Input() polygon_wkt:any
  @Output() closeSidebar = new EventEmitter<boolean>();

  closeDrawer(event: boolean) {
    if (event) this.closeSidebar.emit(true);
  }
}
