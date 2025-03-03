import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private fakeNotificationsSubject = new Subject<any>(); // Subject for fake notifications
  fakeNotifications$ = this.fakeNotificationsSubject.asObservable(); // Observable for UI updates

  constructor(private socket: Socket) {
    this.mockWebSocket(); // Start generating dummy data every 5 seconds
  }
  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }
  getMessage() {
    // return this.socket.fromEvent('message').pipe(map(data => data.msg));
  }

  // ✅ Listen for real-time notifications from WebSocket
  listenForNotifications(): Observable<any> {
    return this.socket.fromEvent('new-notification');
  }

  // ✅ Send a test notification manually (only for debugging)
  sendTestNotification() {
    const testNotification = {
      title: 'Test Notification',
      read: false,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name: 'Manually Triggered Test'
    };

    console.log("📩 Sending Test Notification:", testNotification);
    this.socket.emit('send-notification', testNotification);
  }

  // ✅ Simulate incoming WebSocket notifications every 5 seconds
  private mockWebSocket() {
    interval(10000) // Emit fake notification every 5 seconds
      .pipe(
        map((count) => ({
          title: `Fake Notification ${count + 1}`,
          read: false,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          name: `Dummy Notification ${count + 1}`,
        }))
      )
      .subscribe((notification) => {
        console.log("📩 Simulated WebSocket Notification:", notification);
        this.fakeNotificationsSubject.next(notification); // Emit to subscribers
      });
  }
}

