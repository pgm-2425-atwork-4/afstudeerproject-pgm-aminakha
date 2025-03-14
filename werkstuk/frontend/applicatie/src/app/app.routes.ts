import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './pages/user/user.component';
import { RenderMode, ServerRoute } from '@angular/ssr';


// Function to fetch user IDs from backend API
async function fetchUserIds() {
  try {
    const response = await fetch('https://afstudeerproject-pgm-aminakha.onrender.com/users'); // ✅ API call to fetch users
    const users = await response.json();
    
    return users.map((user: { id: number }) => ({ id: user.id.toString() })); // ✅ Convert IDs to strings
  } catch (error) {
    console.error("🔥 Error fetching user IDs:", error);
    return []; // ✅ Return an empty array to prevent build errors
  }
}

// ✅ Client-side routes (CSR)
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile/:id', component: UserProfileComponent }, // ✅ Ensure this route exists
  { path: '**', redirectTo: '' },
];

// ✅ Server-side routes (SSR) with Prerendering
export const serverRoutes: ServerRoute[] = [
  {
    path: 'user-profile/:id',
    renderMode: RenderMode.Prerender, // ✅ Use Prerendering
    getPrerenderParams: fetchUserIds  // ✅ Fetch user IDs dynamically
  }
];
