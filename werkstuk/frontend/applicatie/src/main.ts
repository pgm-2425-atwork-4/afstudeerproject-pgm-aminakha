import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/pages/home/home.component';
import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { UserProfileComponent } from './app/pages/user/user.component';
import { AdminCategoryComponent } from './app/components/admin-category/admin-category.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // ✅ HTTP Client
    provideRouter([       // ✅ Angular 18 Routing
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      {path: 'register', component: RegisterComponent},
{ path: 'user-profile/:id', component: UserProfileComponent },
      {path: 'admin-dashboard', component: AdminCategoryComponent}
    ])
  ],
}).catch((err) => console.error(err));