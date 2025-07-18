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
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  birthday: string = '';
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

  onFileSelected(event: any) {
    this.profileImage = event.target.files[0]; 
  }
  formData = this.form.value ;
  registerUser() {
    const formData = new FormData();
    formData.append('username', this.formData.username ?? '');
    formData.append('firstname', this.formData.firstname ?? '');
    formData.append('lastname', this.formData.lastname ?? '');
    formData.append('email', this.formData.email ?? '');
    formData.append('password', this.formData.password ?? '');
    formData.append('birthday', this.formData.birthday ?? '');
    
    if (this.profileImage) {
      formData.append('profileImage', this.formData.profileImage ?? '');
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
