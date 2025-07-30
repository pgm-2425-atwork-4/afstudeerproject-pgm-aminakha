import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = 'https://res.cloudinary.com/dwkf8avz2/image/upload/v1742656539/user_uploads/qgz1edlvt97zzbmtkqxt.png'; 

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  })
  message: string = ''; 
  profile_image: string = '';
  constructor(private router: Router, private authService: AuthService) {}

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.setErrors({ invalidLogin: true });
      return;
    }
    this.authService.loginUser(this.form.value.email ?? '', this.form.value.password ?? '').subscribe(
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
