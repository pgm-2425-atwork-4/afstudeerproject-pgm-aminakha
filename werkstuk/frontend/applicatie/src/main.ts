import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/pages/home/home.component';
import { LoginComponent } from './app/pages/login/login.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // ✅ HTTP Client
    provideRouter([       // ✅ Angular 18 Routing
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent }
    ])
  ],
}).catch((err) => console.error(err));