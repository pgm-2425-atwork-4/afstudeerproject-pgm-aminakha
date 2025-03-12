import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    
{
    path: 'login',
    component: LoginComponent    
},
{
    path:'register',
    component: RegisterComponent
}, {
    path:"user/:id",
    component: UserProfileComponent,
    data: { renderMode: 'default' }
}
];
