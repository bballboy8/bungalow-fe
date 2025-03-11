import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private wsUrl = environment.SOCKET_URL;
  private socket$: WebSocketSubject<any> | null = null;
  private retryCount = 0;
  private retryDelay = 1000; // Initial delay (1 second)

  // Observables to track connection status and messages
  private connected$ = new BehaviorSubject<boolean>(false);
  private messages$ = new BehaviorSubject<any>(null);

  constructor() {}

  connect() {
    if (this.socket$) return;

    const url =  `${this.wsUrl}?Authorization=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyMDQ4NzM3NDA3LCJpYXQiOjE3MzMzNzc0MDcsImp0aSI6ImFiM2NlZDZlNTI4MzRlMTdhMjcyOGIzZjY2ZDU4ZjJlIiwidXNlcl9pZCI6MX0.SbZhv67nD5T68FvsercJOrWPje98fppXK22AozfKitc`
    this.socket$ = new WebSocketSubject(url);

    this.socket$.subscribe(
      (message) => {
        console.log('Message received:', message);
        this.messages$.next(message);
      },
      (error) => {
        console.error('WebSocket Error:', error);
        this.connected$.next(false);
        this.handleReconnect();
      },
      () => {
        console.log('WebSocket Closed');
        this.connected$.next(false);
        this.handleReconnect();
      }
    );

    this.connected$.next(true);
    this.retryCount = 0; // Reset retry count on success
    this.retryDelay = 1000; // Reset delay
  }

  sendMessage(message: any) {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  disconnect() {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.connected$.next(false);
    }
  }

  private handleReconnect() {
    if (this.retryCount < 10) {
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.retryCount + 1}`);

        this.retryDelay *= 2; // Exponential backoff
        this.retryCount++;

        this.connect(); // Reconnect
      }, this.retryDelay);
    } else {
      console.error('Max retry attempts reached');
    }
  }

  getMessages() {
    return this.messages$.asObservable();
  }

  isConnected() {
    return this.connected$.asObservable();
  }
}
