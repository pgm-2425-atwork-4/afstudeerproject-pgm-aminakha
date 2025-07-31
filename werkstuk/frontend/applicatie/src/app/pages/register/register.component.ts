import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  backgroundImg: string = 'https://res.cloudinary.com/dwkf8avz2/image/upload/v1742656539/user_uploads/qgz1edlvt97zzbmtkqxt.png'; 
  profileImage: File | null = null; 
  message: string = ''; 

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    birthday: new FormControl('', Validators.required),
    profileImage: new FormControl<File | null>(null)

  }); 

  constructor(private authService: AuthService) {}
  get username() {
    return this.form.get('username');
  }
  get firstname() {
    return this.form.get('firstname');
  }
  get lastname() {
    return this.form.get('lastname');
  }
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  get birthday() {
    return this.form.get('birthday');
  }
  onFileSelected(event: any) {
    this.profileImage = event.target.files[0]; 
  }

  registerUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.setErrors({ invalidLogin: true });
      return;
    }
    const formData = new FormData();
    const values = this.form.value;

    formData.append('username', values.username ?? '');
    formData.append('firstname', values.firstname ?? '');
    formData.append('lastname', values.lastname ?? '');
    formData.append('email', values.email ?? '');
    formData.append('password', values.password ?? '');
    formData.append('birthday', values.birthday ?? '');

    if (this.profileImage) {
      formData.append('profileImage', this.profileImage); 
    }

    this.authService.registerUser(formData).subscribe({
      next: (res) => {
        this.message = '✅ User Registered Successfully!';
        console.log('🚀 Response:', res);
      },
      error: (error) => {
        this.message = '❌ Registration Failed!';
        console.error('🔥 Error:', error);
      }
    });
  }
}
