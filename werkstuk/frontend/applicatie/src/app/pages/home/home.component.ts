import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroHomeComponent } from '../../components/hero-home/hero-home.component';
import { ApiService } from '../../services/api.service';
import { GymCardComponent } from '../../components/gym-card/gym-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroHomeComponent, GymCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gyms: any[] = [];
  filteredGyms: any[] = [];
  savedGyms: any[] = [];
  userId: string | null = null;
  selectedCity: string = 'Gent';  
  selectedCategory: string = 'Indoors';  
  maxGyms: number = 3;  

  constructor(private apiService: ApiService) {}

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
    this.apiService.getGyms().subscribe({
      next: (res) => {
        console.log("✅ Gyms loaded:", res);
        this.gyms = res;
        this.filterGyms();  
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

    this.apiService.getSavedGyms(userId).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          console.log("✅ Saved Gyms Loaded:", res);
          this.savedGyms = res;
        } else {
          console.warn("📭 No saved gyms returned, defaulting to empty list.");
          this.savedGyms = [];
        }
        this.filterGyms();  
      },
      error: (err) => {
        console.error("🔥 Error fetching saved gyms:", err);

        if (err.status === 404) {
          console.log("📭 No saved gyms found. Treating as empty.");
          this.savedGyms = [];
          this.filterGyms();
        }
      }
    });
  }

  filterGyms() {
    this.filteredGyms = this.gyms.filter(gym => 
      gym.city === this.selectedCity && gym.category === this.selectedCategory
    );

    this.filteredGyms = this.filteredGyms.filter(gym => 
      !this.savedGyms.some(savedGym => savedGym.id === gym.id)
    );

    this.filteredGyms = this.filteredGyms.slice(0, this.maxGyms);
  }

  onCityChange(city: string) {
    this.selectedCity = city;
    this.filterGyms();  
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterGyms(); 
  }
}
