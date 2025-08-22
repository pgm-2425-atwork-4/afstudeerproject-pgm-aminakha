import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {  passwordValidator } from './password-validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = 'https://res.cloudinary.com/dwkf8avz2/image/upload/v1742656539/user_uploads/qgz1edlvt97zzbmtkqxt.png'; 
  submitted = false;

  form : FormGroup;
  message: string = ''; 
  profile_image: string = '';
  constructor(private router: Router, private authService: AuthService) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [passwordValidator(this.authService, () => this.form?.value?.email ?? '')],
      updateOn: 'submit'
    })
    });
  }

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  async login() {

    this.password?.markAsTouched();
    this.password?.updateValueAndValidity();

    while (this.form.status === 'PENDING') {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (this.form.invalid) {      
      this.form.markAllAsTouched();
      return;
    }

    this.authService.loginUser(this.form.value.email ?? '', this.form.value.password ?? '').subscribe(
      (res: any) => {
        if (res.token && res.user) {
          localStorage.setItem('auth_token', res.token);
        }
        this.authService.fetchUser();
        this.router.navigate(['/']);
      },
      (error) => {
        if (error.status === 401) {
          this.password?.setErrors({ invalidPassword: true });
          this.password?.markAsTouched();
        } else {
          this.message = 'Er is iets misgegaan. Probeer het later opnieuw.';
        }
      }
    );
  }
}
