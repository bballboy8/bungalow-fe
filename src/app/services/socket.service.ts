import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
 
  constructor(private socket: Socket) {
   
  }
  sendMessage(msg: string) {
    console.log(this.socket,'socketsocketsocket');
    
    this.socket.emit(msg);
  }
  // getMessage() {
  //   console.log('eeeeeeeeeee',);
    
  //   return this.socket.fromEvent('site_update');
  // }
  getMessages(): Observable<any> {
    return new Observable((observer) => {
        this.socket.onAny((event, data) => {  // Listen for ANY event
            console.log(`📩 Received Event: ${event}`, data);
            observer.next({ event, data });
        });
    });
}
getRawMessages(): void {
  this.socket.ioSocket.on('message', (data) => {
      console.log("📩 Raw WebSocket Message Received:", data);
  });

  this.socket.ioSocket.onAny((event, data) => {
      console.log(`📡 Received Any Event: ${event}`, data);
  });

  this.socket.ioSocket.on('connect', () => {
      console.log("✅ WebSocket Connected!");
  });

  this.socket.ioSocket.on('disconnect', (reason) => {
      console.warn("⚠️ WebSocket Disconnected:", reason);
  });

  this.socket.ioSocket.on('connect_error', (error) => {
      console.error("❌ WebSocket Connection Error:", error);
  });
}


  disconnect() {
    console.log('hhhhhhhhhhhhhhh');
    
    this.socket.disconnect();
  }
 
}

