import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; 

  private currentUserSubject = new BehaviorSubject<any>(null); // ✅ Store user in memory
  currentUser$ = this.currentUserSubject.asObservable();

  fetchUser() {
    this.http.get(`${this.apiUrl}/auth/user`, { withCredentials: true }).subscribe({
      next: (user) => {
        console.log("✅ Authenticated User:", user);
        this.currentUserSubject.next(user); // ✅ Update the observable
      },
      error: () => {
        console.log("❌ No authenticated user.");
        this.currentUserSubject.next(null);
      }
    });
  }
  constructor(private http: HttpClient) {
    console.log("🚀 API Base URL:", this.apiUrl);
  }

  wakeUpBackend() {
    console.log("🔥 Trying to wake up backend at:", `${this.apiUrl}/ping`);
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`).subscribe({
      next: (response) => console.log("✅ Backend response:", response.message),
      error: (err) => console.error("❌ Failed to wake up backend:", err)
    });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }
  getUser() {
    return this.http.get(`${this.apiUrl}/auth/user`, { withCredentials: true });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true });
  }
  getAuthUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/user`, {
      withCredentials: true, // ✅ Important: Ensure JWT token is sent
    });
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  getGyms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms`);
  }

  getGymById(gymId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`);
  }

  uploadGymImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post(`${this.apiUrl}/admin/upload-gym-image`, formData);
  }
  addGym(formData: FormData) {
    return this.http.post(`${this.apiUrl}/add-gym`, formData);
  }
  // ✅ Fetch Admin Gyms
getAdminGyms(adminId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/gyms/${adminId}`);
}
getPressureTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/pressures`);
}


getPricingPlans(): Observable<any> {
  console.log("📡 Fetching pricing plans from:", `${this.apiUrl}/pricing`);
  return this.http.get(`${this.apiUrl}/pricing`);
}

getProvinces(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/provinces`);
}
getSavedGyms(userId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/saved-gyms/${userId}`);
}
}
