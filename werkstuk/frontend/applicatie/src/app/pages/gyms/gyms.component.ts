import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { log } from 'console';
import { GymService } from '../../services/gym.service';
import { MetaDataService } from '../../services/meta-data.service';

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
  isFilterModalActive: boolean = false;  
  selectedPersonalTrainer: string = ""; 
  provinces: any[] = [];

  constructor(private gymService: GymService, private metaDataService: MetaDataService) {}

  ngOnInit() {
    this.fetchGyms();
    this.fetchPrices(); 
  }

  toggleFilterModal() {
    if (this.isFilterModalActive) {
      const modalElement = document.querySelector('.filter-modal') as HTMLElement;
      modalElement.classList.remove('active');
      setTimeout(() => {
        this.isFilterModalActive = !this.isFilterModalActive;
      }, 300); 
    } else {
      this.isFilterModalActive = !this.isFilterModalActive;
      setTimeout(() => {
        const modalElement = document.querySelector('.filter-modal') as HTMLElement;
        modalElement.classList.add('active');
      }, 0);
    }
  }

  applyFilters() {
    this.searchGyms();  
    this.toggleFilterModal();  
  }

  fetchGyms() {
    this.gymService.getGyms().subscribe({
      next: (data: any) => {
        this.gyms = data;
        this.filteredGyms = data;
        this.mapPricesToGyms();
        console.log("✅ Gyms loaded:", this.gyms);
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });

    this.metaDataService.getCategories().subscribe({
      next: (data) => {
        console.log("✅ Categories received:", data);
        this.categories = Array.isArray(data) ? data : Object.values(data); 
      },
      error: (error) => {
        console.error("❌ Error fetching categories:", error);
      }
    });

    this.metaDataService.getProvinces().subscribe({
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
    this.metaDataService.getPrices().subscribe({
      next: (data: any) => {
        this.prices = data;
        console.log("💰 Prices loaded:", this.prices);
        this.mapPricesToGyms();
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

  searchGyms() {
    this.filteredGyms = this.gyms.filter(gym => {
      return (
        (this.selectedCity ? gym.city.toLowerCase().includes(this.selectedCity.toLowerCase()) : true) &&
        
        (this.selectedProvince ? gym.province.toLowerCase().includes(this.selectedProvince.toLowerCase()) : true) &&
        
        (this.selectedRating ? gym.rating.toString().charAt(0) === this.selectedRating.charAt(0) : true) &&
        
        (this.selectedType ? gym.category.toLowerCase().includes(this.selectedType.toLowerCase()) : true) &&
        
        (this.selectedPersonalTrainer ? gym.personal_trainer.toString() === this.selectedPersonalTrainer : true) &&
        
        (this.searchQuery ? 
          (gym.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.city.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.province.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
          gym.category.toLowerCase().includes(this.searchQuery.toLowerCase())) : true)
      );
    });
  }
}
