import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { RenderMode, ServerRoute } from '@angular/ssr';

// ✅ Standard client-side routes
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent }, // ✅ Ensure this route exists

  { path: '**', redirectTo: '' },
];

// ✅ Server-side rendering (SSR) routes (NEW WAY in Angular 18)
export const serverRoutes: ServerRoute[] = [
  { path: 'user/:id', renderMode: RenderMode.Server }, // ✅ Forces SSR, prevents prerendering
];
