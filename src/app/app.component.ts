import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { LoadingService } from './services/loading.service';

// import { AppRoutingModule } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxUiLoaderModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnChanges, AfterViewInit {
  title = 'bungalow-app';
  isLoading = false;
  constructor(private LoadingService:LoadingService){

  }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.LoadingService.currentValue.subscribe((value) => {
        this.isLoading = value;
      });
    })

  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.LoadingService.currentValue.subscribe((value) => {
      this.isLoading = value;
    });

  }
}
