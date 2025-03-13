import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; // ✅ Import environment

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // ✅ Uses Render URL

  constructor(private http: HttpClient) {
    console.log("🚀 API Base URL:", this.apiUrl); // ✅ Debug: Check if Render URL is used
  }

  wakeUpBackend() {
    console.log("🔥 Trying to wake up backend at:", `${this.apiUrl}/ping`);
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`)
      .subscribe({
        next: (response) => console.log("✅ Backend response:", response.message),
        error: (err) => console.error("❌ Failed to wake up backend:", err)
      });
  }
}
