import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";

export class GymService { 
  private apiUrl = environment.apiUrl + '/gyms';

  constructor(private http: HttpClient) {}

  getGymImages(gymId: any) {
    return this.http.get(`${this.apiUrl}/${gymId}/images`);
  }
}