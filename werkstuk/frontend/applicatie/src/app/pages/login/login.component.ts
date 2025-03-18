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
        console.log("✅ Login successful:", res);

        // ✅ Fetch the logged-in user immediately after login
        this.apiService.fetchUser();

        this.router.navigate(['/']); // ✅ Redirect to home
      },
      (error) => {
        console.error("🔥 Login Error:", error);
        this.message = '❌ Login Failed! Invalid email or password.';
      }
    );
  }
}
