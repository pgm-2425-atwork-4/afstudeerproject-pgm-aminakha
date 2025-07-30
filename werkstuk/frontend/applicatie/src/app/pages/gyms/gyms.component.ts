import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymService } from '../../services/gym.service';
import { MetaDataService } from '../../services/meta-data.service';
import { ActivatedRoute } from '@angular/router';
import { InfoCardComponent } from '../../components/info-card/info-card.component';
@Component({
  selector: 'app-gyms',
  standalone: true,
  imports: [CommonModule, FormsModule, InfoCardComponent, ReactiveFormsModule],
  templateUrl: './gyms.component.html',
  styleUrls: ['./gyms.component.css']
})
export class GymsComponent implements OnInit {
  gyms: any[] = [];
  isMobile: boolean = window.innerWidth < 768;
  showFilters: boolean = false;
  filteredGyms: any[] = [];
  prices: any[] = [];
  categories: any[] = [];
  provinces: any[] = [];
  form = new FormGroup({
    search: new FormControl('', Validators.required),
    province: new FormControl(''),
    city: new FormControl(''),
    rating: new FormControl(''),
    type: new FormControl(''),
    personalTrainer: new FormControl('')
  });
  get search() {
    return this.form.get('search');
  }
  constructor(private gymService: GymService, private metaDataService: MetaDataService, private route: ActivatedRoute) {}
  resizeHandler = () => this.isMobile = window.innerWidth < 576;

  ngOnInit() {
    window.addEventListener('resize', () => this.isMobile = window.innerWidth < 576);
    console.log(this.isMobile);
    
    this.metaDataService.getProvinces().subscribe({
      next: (data: any) => {
        this.provinces = data;
      },
      error: (error) => {
        console.error("🔥 Error fetching provinces:", error);
      }
    });
    this.route.queryParams.subscribe(params => {
      const query = params['search'];
      const category = params['category'];
      if (query) {
        this.form.get('search')?.setValue(query);
    }
    if (category) {
      this.form.get('type')?.setValue(category);
    }
      this.fetchGyms();
    });
    this.fetchPrices();
    this.metaDataService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (error) => {
        console.error("🔥 Error fetching categories:", error);
      }
    });
    this.form.valueChanges.subscribe(() => {
      this.searchGyms();
    });
  }
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  resetFilters() {
    this.form.reset();
    this.searchGyms();
  }

  fetchGyms() {
    this.gymService.getGyms().subscribe({
      next: (data: any) => {
        this.gyms = data;
        this.filteredGyms = data;
        this.mapPricesToGyms();
        
        this.searchGyms();
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
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
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  const values = this.form.value;

  this.filteredGyms = this.gyms.filter(gym => {
    return (
      (!values.city || gym.city?.toLowerCase().includes(values.city.toLowerCase())) &&
      (!values.province || gym.province?.toLowerCase().includes(values.province.toLowerCase())) &&
      (!values.rating || gym.rating?.toString().charAt(0) === values.rating.charAt(0)) &&
      (!values.type || gym.category?.toLowerCase().includes(values.type.toLowerCase())) &&
      (!values.personalTrainer || gym.personal_trainer?.toString() === values.personalTrainer) &&
      (!values.search || (
        gym.name?.toLowerCase().includes(values.search.toLowerCase()) ||
        gym.city?.toLowerCase().includes(values.search.toLowerCase()) ||
        gym.province?.toLowerCase().includes(values.search.toLowerCase()) ||
        gym.category?.toLowerCase().includes(values.search.toLowerCase())
      ))
    );
  });
}
}
