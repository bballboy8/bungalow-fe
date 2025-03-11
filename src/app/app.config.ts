import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { provideAuth } from './interceptors/auth.provider';
import { provideLoading } from './interceptors/loading/loading.provider';
import { NgxUiLoaderModule, NgxUiLoaderConfig } from 'ngx-ui-loader';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';

const config: SocketIoConfig = { url: environment.SOCKET_URL,   options: {

  query: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyMDQ4NzM3NDA3LCJpYXQiOjE3MzMzNzc0MDcsImp0aSI6ImFiM2NlZDZlNTI4MzRlMTdhMjcyOGIzZjY2ZDU4ZjJlIiwidXNlcl9pZCI6MX0.SbZhv67nD5T68FvsercJOrWPje98fppXK22AozfKitc'

  },
  transports: ['', 'polling'],
  reconnection: true, // Enable automatic reconnection
  reconnectionAttempts: 10, // Maximum reconnection attempts
  reconnectionDelay: 5000, // Delay between attempts (in ms)
}, };
const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsType: 'three-strings',
  fgsColor: '#FCCA40', // Change the loader color
  pbThickness: 5, // Progress bar thickness
  bgsColor: '#20272D',
  bgsOpacity:0.7
};
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(),provideAuth(),provideLoading(), importProvidersFrom([ BrowserAnimationsModule,BrowserModule,
        NgxDaterangepickerMd.forRoot(),NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)])]
};
