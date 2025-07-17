import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service'; // ✅ Import API service
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
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

  constructor(private authService: AuthService) {}

  onFileSelected(event: any) {
    this.profileImage = event.target.files[0]; 
  }

  registerUser() {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('birthday', this.birthday);
    
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
