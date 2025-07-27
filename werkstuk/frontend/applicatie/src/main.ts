import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // ✅ alles komt hiervandaan

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes), // ✅ hoofdrouter hier injecteren
    // of voor GitHub Pages:
    // provideRouter(routes, withHashLocation())
  ],
}).catch((err) => console.error(err));