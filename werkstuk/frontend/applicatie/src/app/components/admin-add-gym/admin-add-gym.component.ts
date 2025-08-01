import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaDataService } from '../../services/meta-data.service';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-admin-add-gym',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-add-gym.component.html',
  styleUrls: ['./admin-add-gym.component.css']
})
export class AdminAddGymComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    rating: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(5)]),
    opening_hours: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    personal_trainer: new FormControl(false),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    website: new FormControl('', Validators.required),
    pressure_id: new FormControl(null, Validators.required),
    category_id: new FormControl(null, Validators.required),
    province_id: new FormControl(null, Validators.required),
    priceOne: new FormControl(null, Validators.required),
    descriptionOne: new FormControl('', Validators.required),
    planTypeOne: new FormControl('', Validators.required),
    priceTwo: new FormControl(null, Validators.required),
    descriptionTwo: new FormControl('', Validators.required),
    planTypeTwo: new FormControl('', Validators.required),
    priceThree: new FormControl(null, Validators.required),
    descriptionThree: new FormControl('', Validators.required),
    planTypeThree: new FormControl('', Validators.required),
    logo: new FormControl<File | null>(null),
    images: new FormControl<File[] | null>(null)
  })
  

  selectedLogo: File | null = null;
  selectedImages: File[] = [];

  pressures: any[] = [];
  categories: any[] = [];
  pricingPlans: any[] = [];
  provinces: any[] = [];

  constructor(private metaDataService: MetaDataService, private gymService: GymService) {}

  ngOnInit() {
    this.metaDataService.getPressureTypes().subscribe((data: any) => this.pressures = data);
    this.metaDataService.getCategories().subscribe((data: any) => this.categories = data);
    this.metaDataService.getPricingPlans().subscribe((data: any) => this.pricingPlans = data);
    this.metaDataService.getProvinces().subscribe((data: any) => this.provinces = data);
  }

  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files[0];
  }

  onImagesSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
  }

  addGym() {
    const formData = new FormData();
    const data = this.form.value;

    formData.append('name', data.name ?? '');
    formData.append('city', data.city ?? '');
    formData.append('rating', data.rating ?? '');
    formData.append('opening_hours', data.opening_hours ?? '');
    formData.append('address', data.address ?? '');
    formData.append('personal_trainer', data.personal_trainer ? '1' : '0');
    formData.append('pressure_id', data.pressure_id ?? '');
    formData.append('category_id', data.category_id ?? '');
    formData.append('province_id', data.province_id ?? '');
    formData.append("priceOne", data.priceOne ?? '');
    formData.append("descriptionOne", data.descriptionOne ?? '');
    formData.append("priceTwo", data.priceTwo ?? '');
    formData.append("descriptionTwo", data.descriptionTwo ?? '');
    formData.append("priceThree", data.priceThree ?? '');
    formData.append("descriptionThree", data.descriptionThree ?? '');
    formData.append("planTypeOne", data.planTypeOne ?? '');
    formData.append("planTypeTwo", data.planTypeTwo ?? '');
    formData.append("planTypeThree", data.planTypeThree ?? '');

    formData.append('email', data.email ?? '');
    formData.append('phone', data.phone ?? '');
    formData.append('website', data.website ?? '');

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    this.selectedImages.forEach((file) => {
      formData.append('images', file);
    });

    console.log('📦 Form Data:', formData);
    
    this.gymService.addGym(formData).subscribe({
      next: (res) => {        
        console.log('✅ Gym Added:', res);
        alert('Gym added successfully!');
      },
      error: (err) => {
        console.error('🔥 Error adding gym:', err);
        alert('Failed to add gym.');
      }
    });
  }
  updateGym(gymId: number) {
  const data = this.form.value as any;

  const formData = new FormData();

  formData.append('name', data.name ?? '');
  formData.append('city', data.city ?? '');
  formData.append('rating', data.rating?.toString() ?? '');
  formData.append('opening_hours', data.opening_hours ?? '');
  formData.append('address', data.address ?? '');
  formData.append('personal_trainer', data.personal_trainer ? '1' : '0');
  formData.append('pressure_id', data.pressure_id?.toString() ?? '');
  formData.append('category_id', data.category_id?.toString() ?? '');
  formData.append('province_id', data.province_id?.toString() ?? '');

  formData.append('priceOne', data.priceOne?.toString() ?? '');
  formData.append('descriptionOne', data.descriptionOne ?? '');
  formData.append('priceTwo', data.priceTwo?.toString() ?? '');
  formData.append('descriptionTwo', data.descriptionTwo ?? '');
  formData.append('priceThree', data.priceThree?.toString() ?? '');
  formData.append('descriptionThree', data.descriptionThree ?? '');
  formData.append('planTypeOne', data.planTypeOne ?? '');
  formData.append('planTypeTwo', data.planTypeTwo ?? '');
  formData.append('planTypeThree', data.planTypeThree ?? '');

  formData.append('email', data.email ?? '');
  formData.append('phone', data.phone ?? '');
  formData.append('website', data.website ?? '');

  if (this.selectedLogo) {
    formData.append('logo', this.selectedLogo);
  }

  this.selectedImages.forEach((file) => {
    formData.append('images', file);
  });

  this.gymService.updateGym(gymId, formData).subscribe({
    next: (res) => {
      alert('✅ Gym updated!');
    },
    error: (err) => {
      console.error('🔥 Error updating gym:', err);
      alert('❌ Failed to update gym.');
    }
  });
}
  deleteGym(gymId: number) {
    if (!confirm('Weet je zeker dat je deze gym wilt verwijderen?')) return;

    this.gymService.deleteGym(gymId).subscribe({
      next: () => {
        alert('🗑️ Gym verwijderd!');
      },
      error: (err) => {
        console.error('🔥 Error deleting gym:', err);
        alert('❌ Verwijderen mislukt.');
      }
    });
}

  addPricing() {
  this.pricingPlans.push({});
  console.log("✅ New pricing plan added:", this.pricingPlans);
  
  
}
}
