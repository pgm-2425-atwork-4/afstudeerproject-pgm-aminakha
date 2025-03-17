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
    this.apiService.loginUser(this.email, this.password).subscribe({
      next: (response) => {
        console.log("✅ Login successful:", response);

        if (response.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-profile', response.user.id]); // ✅ Pass user ID
        }
      },
      error: () => {
        this.message = '❌ Login Failed! Invalid email or password.';
      }
    });
  }
}
