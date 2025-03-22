import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { fetchUserIds } from '../server';
import { GymsComponent } from './pages/gyms/gyms.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { AdminAddGymComponent } from './components/admin-add-gym/admin-add-gym.component';
import { GymDetailComponent } from './pages/gym-detail/gym-detail.component';
import { OverOnsComponent } from './pages/over-ons/over-ons.component';


// ✅ Client-side routes (CSR)
export const routes: Routes = [
  { path: '/afstudeerproject-pgm-aminakha', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent },
  {path:"gyms", component: GymsComponent},
  { path: 'gym-detail/:id', component: GymDetailComponent },
{path:"over-ons", component: OverOnsComponent},
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    children: [
      { path: '', redirectTo: 'categories', pathMatch: 'full' }, // Default admin route
      { path: 'categories', component: AdminCategoryComponent },
      { path: 'gyms', component: GymsComponent },
      { path: 'add-gym', component: AdminAddGymComponent } // ✅ Ensure this matches
    ]
  },  
  { path: '**', redirectTo: '' }
  
];

// ✅ Server-side routes (SSR) with Prerendering
export const serverRoutes: ServerRoute[] = [
  {
    path: 'user-profile/:id', // ✅ Must match main.ts
    renderMode: RenderMode.Prerender,
    getPrerenderParams: fetchUserIds  // ✅ Fetch user IDs dynamically
  }
];
