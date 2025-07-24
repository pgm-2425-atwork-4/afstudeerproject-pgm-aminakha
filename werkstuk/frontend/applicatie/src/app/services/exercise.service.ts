import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../environments/environment";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class ExerciseService { 
  private apiUrl = environment.apiUrl + '/exercises';
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.warn("❌ No auth token found in localStorage!");
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  constructor(private http: HttpClient) {}
  getExercises() {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }
  getExerciseCategories() {
    return this.http.get(`${this.apiUrl}/categories`);
  }
  addExercise(exercise: any){
    return this.http.post(`${this.apiUrl}/admin/add-exercise`, exercise, {
      headers: this.getAuthHeaders()
    });
  }
  getPressures() {
    return this.http.get(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }
  
}