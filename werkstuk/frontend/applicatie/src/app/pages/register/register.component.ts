import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  backgroundImg: string = '/images/running.png'; 
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  birthday: string = '';
  profileImage: File | null = null; 
  message: string = ''; 

  constructor(private http: HttpClient) {}

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

    this.http.post('http://localhost:5000/register', formData).subscribe(
      (res: any) => {
        this.message = '✅ User Registered Successfully!';
        console.log('🚀 Response:', res);
      },
      (error) => {
        this.message = '❌ Registration Failed!';
        console.error('🔥 Error:', error);
      }
    );
  }
}
