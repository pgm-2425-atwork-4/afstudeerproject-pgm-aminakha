import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://afstudeerproject-pgm-aminakha.onrender.com'; // ✅ Replace with your actual Render backend URL

  constructor(private http: HttpClient) {}

  /**
   * Wake up the backend (Prevent cold start issues)
   */
  wakeUpBackend() {
    this.http.get(`${this.apiUrl}/ping`, { responseType: 'text' }) // ✅ Expect text response
      .subscribe({
        next: (response) => console.log("✅ Backend response:", response),
        error: (err) => console.error("❌ Failed to wake up backend:", err)
      });
  }
}
