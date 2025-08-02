import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { GymsComponent } from './pages/gyms/gyms.component';
import { GymDetailComponent } from './pages/gym-detail/gym-detail.component';
import { OverOnsComponent } from './pages/over-ons/over-ons.component';
import { ExercisesComponent } from './pages/exercises/exercises.component';
import { ExerciseDetailComponent } from './pages/exercise-detail/exercise-detail.component';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { AdminAddGymComponent } from './components/admin-add-gym/admin-add-gym.component';
import { AdminAddExerciseCategoryComponent } from './components/admin-add-exercise-category/admin-add-exercise-category.component';
import { AdminAddExerciseComponent } from './components/admin-add-exercise/admin-add-exercise.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'afstudeerproject-pgm-aminakha', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent },
  { path: 'gyms', component: GymsComponent },
  { path: 'gym-detail/:id', component: GymDetailComponent },
  { path: 'over-ons', component: OverOnsComponent },
  { path: 'oefeningen', component: ExercisesComponent },
  { path: 'oefening-detail/:id', component: ExerciseDetailComponent },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'categories', pathMatch: 'full' },
      { path: 'categories', component: AdminCategoryComponent },
      { path: 'add-gym', component: AdminAddGymComponent },
      { path: 'add-exercise-category', component: AdminAddExerciseCategoryComponent },
      { path: 'add-exercise', component: AdminAddExerciseComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
