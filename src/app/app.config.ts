import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { HttpClientModule } from '@angular/common/http';
import { provideAuth } from './interceptors/auth.provider';
import { provideLoading } from './interceptors/loading/loading.provider';
import { NgxUiLoaderModule, NgxUiLoaderConfig } from 'ngx-ui-loader';
const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsType: 'three-strings',
  fgsColor: '#00ACC1', // Change the loader color
  pbThickness: 5, // Progress bar thickness
};
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(),provideAuth(),provideLoading(), importProvidersFrom([ BrowserAnimationsModule,BrowserModule,NgxDaterangepickerMd.forRoot(),HttpClientModule,NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)])]
};
