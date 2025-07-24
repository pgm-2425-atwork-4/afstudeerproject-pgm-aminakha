import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GymService } from '../../services/gym.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MetaDataService } from '../../services/meta-data.service';
import {CategoriesComponent} from '../../components/categories/categories.component';
import { PopularComponent } from '../../components/popular/popular.component';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { InfoCardComponent } from '../../components/info-card/info-card.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gyms: any[] = [];
  savedGyms: any[] = [];
  userId: string | null = null;
  gymCategories: any[] = [];  
  form = new FormGroup({
    query: new FormControl('', Validators.required)
  });
  randomMotivation: any;
  motivations = [
    {
      text: "“Success is doing what you have to do, even when you don’t feel like it.”",
      author: '@Daniël Storm',
      image: 'images/daniel.png'
    }, 
    {
      text: "“Discipline is choosing between what you want now and what you want most.”",
      author: '@Sven Richter',
      image: 'images/sven.png'
    },
    {
      text: "“Your body can stand almost anything. It’s your mind you have to convince.”",
      author: '@Noah de Vries',
      image: 'images/noah.png'
  }];
  constructor(private gymService: GymService, private router: Router, private metadataService: MetaDataService) {}

  ngOnInit() {
    const token = localStorage.getItem("auth_token");
    console.log("🔍 Stored Token:", token); 
    
    if (token) {
      const decodedToken = this.decodeJWT(token);
      console.log("🔑 Decoded Token:", decodedToken);

      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id.toString();
        console.log("🆔 User ID from Token:", this.userId);
        
        this.fetchSavedGyms(this.userId);
      }
    }

    this.fetchGyms();
    this.randomMotivation = this.motivations[Math.floor(Math.random() * this.motivations.length)];
    this.metadataService.getCategories().subscribe({
      next: (res: any) => {
        console.log("✅ Categories loaded:", res);
        this.gymCategories = res;
        console.log("🔍 Gym Categories:", this.gymCategories);
        
      },
      error: (err) => {
        console.error("🔥 Error fetching categories:", err);
      }
    });    
  }
  onSearchSubmit() {
      const searchValue = this.form.get('query')?.value?.trim();
      if (searchValue) {
        this.router.navigate(['/gyms'], { queryParams: { search: searchValue } });
      }
    }
  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid token structure");
      return null;
    }
    
    const payload = parts[1]; 
    const decoded = atob(payload); 
    return JSON.parse(decoded); 
  }

  fetchGyms() {
    this.gymService.getGyms().subscribe({
      next: (res: any) => {
        console.log("✅ Gyms loaded:", res);
        this.gyms = res;
      },
      error: (err) => {
        console.error("🔥 Error fetching gyms:", err);
      }
    });
  }

  fetchSavedGyms(userId: string | null) {
    if (!userId) {
      console.warn("⚠️ No user ID provided. Skipping saved gyms fetch.");
      return;
    }

    this.gymService.getSavedGyms(userId).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          console.log("✅ Saved Gyms Loaded:", res);
          this.savedGyms = res;
        } else {
          console.warn("📭 No saved gyms returned, defaulting to empty list.");
          this.savedGyms = [];
        }
      },
      error: (err) => {
        console.error("🔥 Error fetching saved gyms:", err);

        if (err.status === 404) {
          console.log("📭 No saved gyms found. Treating as empty.");
          this.savedGyms = [];
        }
      }
    });
  }
}