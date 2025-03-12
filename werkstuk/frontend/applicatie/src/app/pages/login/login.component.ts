import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient, private router: Router) {}

  login() {
  this.http.post('http://localhost:5000/login', { email: this.email, password: this.password }).subscribe(
    (res: any) => {
      localStorage.setItem('user', JSON.stringify(res.user));
      // trigger om de navbar te updaten
      window.dispatchEvent(new Event('storage'));

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
