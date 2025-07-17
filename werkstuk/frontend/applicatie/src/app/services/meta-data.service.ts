import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MetaDataService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
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
  getPressureTypes() {
    return this.http.get<any[]>(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }
  getPricingPlans() {
    return this.http.get(`${this.apiUrl}/prices`, { headers: this.getAuthHeaders() });
  }
  getProvinces(){
    return this.http.get<any[]>(`${this.apiUrl}/provinces`, { headers: this.getAuthHeaders() });
  }
  getPrices() {
    return this.http.get(`${this.apiUrl}/prices`, { headers: this.getAuthHeaders() });
  }
  getCategories() {
    return this.http.get<any>(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }
}
