// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from "./app/app.component";
import { authInterceptor } from "./app/interceptors/auth.interceptor";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';  // Import NoopAnimationsModule
import { provideAnimations } from '@angular/platform-browser/animations'; // Import provideAnimations for Angular 18

// Bootstrap the application and provide HTTP interceptors
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),  // Configure HTTP client
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    },
    provideAnimations()  // Use this instead of importing NoopAnimationsModule in `imports`
  ]
})
  .catch((err) => console.error(err));