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
  providers: [],
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
    
    
  }

  sendMessage() {
    
      this.message = {
        "type": "site_update",
        "site_name": "nmb",
        "site_id": 5,
        "new_updates": "",
        "time": ""
      }
      this.socketService.sendMessage(this.message);
      this.message = ''; // Clear input after sending
    
  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.LoadingService.currentValue.subscribe((value) => {
        this.isLoading = value;
      });
    })
    setTimeout(()=>{
      console.log(this.socketService.getMessages().subscribe((msg)=>{return msg}),'ddddddddddddd');
    
      this.socketService.getMessages().subscribe((msg) => {
       console.log(msg,'ooooooooooooooo');
       
      });
      this.socketService.getRawMessages()
    },5000)
    

  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.LoadingService.currentValue.subscribe((value) => {
      this.isLoading = value;
    });

  }

  ngOnDestroy() {
    this.socketService.disconnect(); // Close the WebSocket connection
  }
}
