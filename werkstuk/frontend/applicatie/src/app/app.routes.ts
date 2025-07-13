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
import { ExercisesComponent } from './pages/exercises/exercises.component';
import { AdminAddExerciseCategoryComponent } from './components/admin-add-exercise-category/admin-add-exercise-category.component';
import { AdminAddExerciseComponent } from './components/admin-add-exercise/admin-add-exercise.component';
import { AdminGymsComponent } from './components/admin-gyms/admin-gyms.component';

export const routes: Routes = [
  { path: '/afstudeerproject-pgm-aminakha', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent },
  {path:"gyms", component: GymsComponent},
  { path: 'gym-detail/:id', component: GymDetailComponent },
{path:"over-ons", component: OverOnsComponent},
{path:"oefeningen", component: ExercisesComponent},
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    children: [
      { path: '', redirectTo: 'categories', pathMatch: 'full' },
      { path: 'categories', component: AdminCategoryComponent },
      { path: 'gyms', component: AdminGymsComponent },
      { path: 'add-gym', component: AdminAddGymComponent },
      {path:"add-exercise-category",component:AdminAddExerciseCategoryComponent},
      {path:"add-exercise",component:AdminAddExerciseComponent}
    ]
  },  
  { path: '**', redirectTo: '' }
  
];

export const serverRoutes: ServerRoute[] = [
  {
    path: 'user-profile/:id', 
    renderMode: RenderMode.Prerender,
    getPrerenderParams: fetchUserIds 
  }
];
