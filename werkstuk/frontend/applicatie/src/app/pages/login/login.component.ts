import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], // ✅ Ensure RouterModule is included
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  backgroundImg: string = '/images/running.png'; // ✅ Ensure correct path
  email: string = ''; // ✅ Use "email" instead of "username"
  password: string = '';
  message: string = ''; // ✅ Show success/error messages

  constructor(private http: HttpClient, private router: Router) {}

  login() {
  this.http.post('http://localhost:5000/login', { email: this.email, password: this.password }).subscribe(
    (res: any) => {
      localStorage.setItem('user', JSON.stringify(res.user));

      // ✅ Trigger storage event so navbar updates
      window.dispatchEvent(new Event('storage'));

      // ✅ Redirect after login
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
