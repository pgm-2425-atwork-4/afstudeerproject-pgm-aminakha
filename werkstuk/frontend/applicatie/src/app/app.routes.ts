import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { fetchUserIds } from '../server';



// ✅ Client-side routes (CSR)
export const routes: Routes = [
  { path: '/afstudeerproject-pgm-aminakha', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent }, // ✅ Ensure this route exists
  { path: '**', redirectTo: '' },
];

// ✅ Server-side routes (SSR) with Prerendering
export const serverRoutes: ServerRoute[] = [
  {
    path: 'user-profile/:id', // ✅ Must match main.ts
    renderMode: RenderMode.Prerender,
    getPrerenderParams: fetchUserIds  // ✅ Fetch user IDs dynamically
  }
];
