import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = '/images/running.png'; 
  email: string = ''; 
  password: string = '';
  message: string = ''; 

  constructor(private apiService: ApiService, private router: Router) {}

  login() {
    this.apiService.loginUser(this.email, this.password).subscribe(
      (res: any) => {
        if (res.user) {
          console.log("✅ Login successful:", res.user);
          localStorage.setItem('user', JSON.stringify(res.user)); // ✅ Store user data
          window.dispatchEvent(new Event('storage')); // ✅ Update navbar dynamically
  
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/home']); // ✅ Redirect to Home so saved gyms load
          }
        }
      },
      (error) => {
        this.message = '❌ Login Failed! Invalid email or password.';
      }
    );
  }
}
