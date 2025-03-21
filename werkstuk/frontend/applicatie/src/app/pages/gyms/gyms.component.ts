import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { log } from 'console';

@Component({
  selector: 'app-gyms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gyms.component.html',
  styleUrls: ['./gyms.component.css']
})
export class GymsComponent implements OnInit {
  gyms: any[] = [];
  filteredGyms: any[] = [];
  searchQuery: string = "";
  prices: any[] = [];
  categories: any[] = [];
  selectedProvince: string = "";
  selectedCity: string = "";
  selectedRating: string = "";
  selectedType: string = "";
  isFilterModalActive: boolean = false;  // Track filter modal visibility
  selectedPersonalTrainer: string = ""; // This will store "JA" or "NEE"
  provinces: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchGyms();
    this.fetchPrices(); // Fetch prices separately
  }

  // Method to toggle filter modal visibility
  toggleFilterModal() {
    // When closing, add the animation class for sliding out
    if (this.isFilterModalActive) {
      const modalElement = document.querySelector('.filter-modal') as HTMLElement;
      modalElement.classList.remove('active');
      setTimeout(() => {
        this.isFilterModalActive = !this.isFilterModalActive;
      }, 300); // Wait for the slide-out animation to finish before updating the state
    } else {
      // When opening, add the "active" class to slide in
      this.isFilterModalActive = !this.isFilterModalActive;
      setTimeout(() => {
        const modalElement = document.querySelector('.filter-modal') as HTMLElement;
        modalElement.classList.add('active');
      }, 0);
    }
  }

  // Apply the selected filters
  applyFilters() {
    this.searchGyms();  // Apply the filters when clicking "Apply Filters"
    this.toggleFilterModal();  // Close the modal after applying filters
  }

  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        this.gyms = data;
        this.filteredGyms = data;
        this.mapPricesToGyms(); // Ensure gyms have their prices
        console.log("✅ Gyms loaded:", this.gyms);
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });

    this.apiService.getCategories().subscribe({
      next: (data) => {
        console.log("✅ Categories received:", data);
        this.categories = Array.isArray(data) ? data : Object.values(data); // ✅ Ensure correct data format
      },
      error: (error) => {
        console.error("❌ Error fetching categories:", error);
      }
    });

    this.apiService.getProvinces().subscribe({
      next: (data) => {
        console.log("✅ Provinces received:", data);
        this.provinces = Array.isArray(data) ? data : Object.values(data); // ✅ Ensure correct data format
      },
      error: (error) => {
        console.error("❌ Error fetching provinces:", error);
      }
    });
  }

  fetchPrices() {
    this.apiService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        console.log("💰 Prices loaded:", this.prices);
        this.mapPricesToGyms(); // Update gyms with price details
      },
      error: (error) => {
        console.error("🔥 Error fetching prices:", error);
      }
    });
  }

  mapPricesToGyms() {
    if (this.gyms.length > 0 && this.prices.length > 0) {
      this.gyms.forEach(gym => {
        const priceDetail = this.prices.find(p => p.id === gym.pricing_id);
        gym.priceBundle = priceDetail ? priceDetail.bundle_name : "N/A niet" ;
        gym.price = priceDetail ? priceDetail.price : "N/A";
      });
    }
  }

  // Search and apply filters on gyms
  searchGyms() {
    this.filteredGyms = this.gyms.filter(gym => {
      return (
        // Filter by city
        (this.selectedCity ? gym.city.toLowerCase().includes(this.selectedCity.toLowerCase()) : true) &&
        
        // Filter by province
        (this.selectedProvince ? gym.province.toLowerCase().includes(this.selectedProvince.toLowerCase()) : true) &&
        
        // Filter by rating (first character of rating matches the selected rating)
        (this.selectedRating ? gym.rating.toString().charAt(0) === this.selectedRating.charAt(0) : true) &&
        
        // Filter by gym type
        (this.selectedType ? gym.category.toLowerCase().includes(this.selectedType.toLowerCase()) : true) &&
        
        // Filter by personal trainer (based on user selection of 'JA' or 'NEE')
        (this.selectedPersonalTrainer ? gym.personal_trainer.toString() === this.selectedPersonalTrainer : true) &&
        
        // Search query filter
        (this.searchQuery ? 
          (gym.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.city.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.province.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.category.toLowerCase().includes(this.searchQuery.toLowerCase())) : true)
      );
    });
  }
}
