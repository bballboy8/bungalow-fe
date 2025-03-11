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
    this.socket.emit('message', msg);
  }
  getMessage() {
    console.log('getMessagegetMessage',this.socket.fromEvent('site_update'));
    
    return this.socket.fromEvent('site_update');
  }

  // ✅ Listen for real-time notifications from WebSocket

 
}

