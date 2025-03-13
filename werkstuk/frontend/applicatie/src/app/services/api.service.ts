import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; // ✅ Import environment

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // ✅ Use dynamic environment variable

  constructor(private http: HttpClient) {}

  wakeUpBackend() {
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`) // ✅ Automatically switches URL based on environment
      .subscribe({
        next: (response) => console.log("✅ Backend response:", response.message),
        error: (err) => console.error("❌ Failed to wake up backend:", err)
      });
  }
}
