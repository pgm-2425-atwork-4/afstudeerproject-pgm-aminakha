import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    
{
    path: 'login',
    component: LoginComponent    
}
];
