import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { LoadingService } from './services/loading.service';
import { SocketService } from './services/socket.service';
import { Subscription } from 'rxjs';

// import { AppRoutingModule } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent,NgxUiLoaderModule],
  providers: [SocketService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnChanges, AfterViewInit {
  title = 'bungalow-app';
  isLoading = false;
  private socketSubscription!: Subscription;
  message: any;
  constructor(private LoadingService:LoadingService,private socketService: SocketService){

  }
  ngOnInit(): void {
    
    this.socketService.getMessage().subscribe((msg: string) => {
      console.log('Message received from socket:', msg);
      this.message = msg; // Assign the received message to a variable
    });
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
