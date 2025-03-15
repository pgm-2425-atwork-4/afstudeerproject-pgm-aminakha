import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service'; // ✅ Import API service


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = '/afstudeerproject-pgm-aminakha/images/running.png'; 
  email: string = ''; 
  password: string = '';
  message: string = ''; 

  constructor(private apiService : ApiService , private http: HttpClient, private router: Router) {}

  login() {
    this.http.post('https://afstudeerproject-pgm-aminakha.onrender.com/login', {
      email: this.email,
      password: this.password
    }).subscribe(
      (res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage')); // ✅ Update navbar dynamically
  
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-profile']);
        }
      },
      (error) => {
        this.message = '❌ Login Failed! Invalid email or password.';
      }
    );
  }
}
