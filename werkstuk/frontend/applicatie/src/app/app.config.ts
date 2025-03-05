import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import {routes} from './app.routes'; // ✅ Import routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), 
    provideRouter(routes), // ✅ Fix: Provide routes
    importProvidersFrom(FormsModule) // ✅ Fix: Enable ngModel globally
  ]
};
