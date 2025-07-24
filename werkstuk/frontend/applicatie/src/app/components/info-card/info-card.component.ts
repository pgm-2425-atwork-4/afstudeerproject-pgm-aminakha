import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'info-card',
  imports: [CommonModule,RouterLink, ],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css'
})
export class InfoCardComponent {
@Input() items: any[] = [];
@Input() type: string = '';
popularGyms: any[] = [];
  ngOnChanges() {
    if (Array.isArray(this.items) && Array.isArray(this.items[0])) {
      this.items = this.items[0]; 
    }
     if (this.type === 'gym') {
      this.popularGyms = this.items
        .filter(gym => gym.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5); 
        
    } else {
      this.popularGyms = this.items;
    }
  }
}