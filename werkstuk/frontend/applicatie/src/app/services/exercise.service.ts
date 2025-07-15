import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class ExerciseService { 
  private apiUrl = environment.apiUrl + '/exercises';

  constructor(private http: HttpClient) {}

  getExerciseCategories() {
    return this.http.get(`${this.apiUrl}/categories`);
  }
}