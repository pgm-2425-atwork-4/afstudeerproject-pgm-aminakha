import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import KeenSlider from "keen-slider";
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';
@Component({
  selector: 'card-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})
export class CardListComponent {
  @Input() type: 'category' | 'gym' = 'category';
  @Input() items: any[] = [];
  @Input() title: string = '';
  popularGyms: any[] = [];

  constructor(private router: Router) {}
  ngOnChanges() {
      if (this.type === 'gym') {
      this.popularGyms = this.items
        .filter(gym => gym.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5); 
        console.log("Filtered gyms:", this.popularGyms);
        
    } else {
      this.popularGyms = this.items;
    }
  }
  navigate(item: any) {
    if (this.type === 'gym') {
      this.router.navigate(['/gyms', item.id]);
    } else {
      this.router.navigate(['/gyms'], {
        queryParams: { category: item.name }
      });
    }
  }

}
