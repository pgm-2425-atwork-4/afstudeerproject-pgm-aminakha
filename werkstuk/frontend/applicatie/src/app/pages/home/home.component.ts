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
  selectedCity: string = 'Gent';  // Default city selection
  selectedCategory: string = 'Indoors';  // Default category selection
  maxGyms: number = 3;  // Limit to 3 gyms

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const token = localStorage.getItem("auth_token"); // Get the token from localStorage
    console.log("🔍 Stored Token:", token); // Debugging token
    
    if (token) {
      // Decode the token to extract the payload
      const decodedToken = this.decodeJWT(token);
      console.log("🔑 Decoded Token:", decodedToken);

      // Extract userId from the decoded payload
      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id.toString(); // Save userId
        console.log("🆔 User ID from Token:", this.userId);
        
        // Fetch saved gyms after extracting the userId
        this.fetchSavedGyms(this.userId);
      }
    }

    // Fetch gyms regardless of user status
    this.fetchGyms();
  }

  // Decode JWT Token function
  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid token structure");
      return null;
    }
    
    const payload = parts[1]; // The payload is the second part of the token
    const decoded = atob(payload); // Decode the Base64 string
    return JSON.parse(decoded); // Parse it into a JSON object
  }

  // Fetch gyms from the API
  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (res) => {
        console.log("✅ Gyms loaded:", res);
        this.gyms = res;
        this.filterGyms();  // Apply filter when gyms are loaded
      },
      error: (err) => {
        console.error("🔥 Error fetching gyms:", err);
      }
    });
  }

  // Fetch saved gyms for the logged-in user
  fetchSavedGyms(userId: string | null) {
    if (!userId) {
      console.warn("⚠️ No user ID provided. Skipping saved gyms fetch.");
      return;
    }
  
    this.apiService.getSavedGyms(userId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gyms Loaded:", res);
        this.savedGyms = res;
        this.filterGyms();  // Reapply filters after loading saved gyms
      },
      error: (err) => {
        console.error("🔥 Error fetching saved gyms:", err);
      }
    });
  }

  // This method will filter gyms based on the selected city, category, and remove saved gyms
  filterGyms() {
    // Filter gyms by city and category
    this.filteredGyms = this.gyms.filter(gym => 
      gym.city === this.selectedCity && gym.category === this.selectedCategory
    );

    // Remove gyms that the user has already saved
    this.filteredGyms = this.filteredGyms.filter(gym => 
      !this.savedGyms.some(savedGym => savedGym.id === gym.id)
    );

    // Limit to only the first 3 gyms
    this.filteredGyms = this.filteredGyms.slice(0, this.maxGyms);
  }

  // Method to handle city change
  onCityChange(city: string) {
    this.selectedCity = city;
    this.filterGyms();  // Reapply filter when city changes
  }

  // Method to handle category change
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterGyms();  // Reapply filter when category changes
  }
}
