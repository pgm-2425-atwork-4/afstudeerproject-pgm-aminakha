import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; // ✅ Import environment
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // ✅ Uses Render URL

  constructor(private http: HttpClient) {
    console.log("🚀 API Base URL:", this.apiUrl); // ✅ Debug: Check if Render URL is used
  }

  /**
   * Wake up the backend (Prevent cold start issues)
   */
  wakeUpBackend() {
    console.log("🔥 Trying to wake up backend at:", `${this.apiUrl}/ping`);
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`)
      .subscribe({
        next: (response) => console.log("✅ Backend response:", response.message),
        error: (err) => console.error("❌ Failed to wake up backend:", err)
      });
  }

  /**
   * Fetch categories from the backend
   */
  getCategories(): Observable<any> {
    console.log("📡 Fetching categories from:", `${this.apiUrl}/categories`);
    return this.http.get(`${this.apiUrl}/categories`);
  }
  getUsers(): Observable<any> {
    console.log("📡 Fetching users from:", `${this.apiUrl}/users`);
    return this.http.get(`${this.apiUrl}/users`);
  }
  getUserById(userId: string) {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }
  registerUser(formData: FormData) {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }
  loginUser(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  getGyms(): Observable<any> {
    console.log("📡 Fetching gyms from:", `${this.apiUrl}/gyms`);
    return this.http.get(`${this.apiUrl}/gyms`);
  }
  getGymById(gymId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`);
  }
}
