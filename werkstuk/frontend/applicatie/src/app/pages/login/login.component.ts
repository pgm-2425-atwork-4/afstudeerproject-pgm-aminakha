import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = 'https://res.cloudinary.com/dwkf8avz2/image/upload/v1742656539/user_uploads/qgz1edlvt97zzbmtkqxt.png'; 
  email: string = ''; 
  password: string = '';
  message: string = ''; 
  profile_image: string = '';
  constructor(private apiService: ApiService, private router: Router, private authService: AuthService) {}

  login() {
    this.authService.loginUser(this.email, this.password, this.profile_image).subscribe(
      (res: any) => {
        console.log("✅ Login successful:", res);
        if (res.token && res.user) {
          localStorage.setItem('auth_token', res.token); 
          console.log('Stored User in LocalStorage:', res.user);
        }
        this.authService.fetchUser();

        this.router.navigate(['/']); 
      },
      (error) => {
        console.error("🔥 Login Error:", error);
        this.message = '❌ Login Failed! Invalid email or password.';
      }
    );
  }
}
