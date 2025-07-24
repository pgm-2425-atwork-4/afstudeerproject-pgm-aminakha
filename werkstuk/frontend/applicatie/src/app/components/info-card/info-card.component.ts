import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'info-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css'
})
export class InfoCardComponent {
  @Input() items: any[] = [];
  @Input() type: string = '';
  popularGyms: any[] = [];
  foundExerciseImage: any;
  constructor(private exerciseService: ExerciseService) {}
  ngOnChanges() {
    if (Array.isArray(this.items) && Array.isArray(this.items[0])) {
    this.items = this.items[0];
  }

  if (!Array.isArray(this.items) || this.items.length === 0) {
    console.warn('🚫 No items to display');
    return;
  }

  if (this.type === 'gym') {
    this.popularGyms = this.items
      .filter(gym => gym.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5); 
  } else {
    this.popularGyms = this.items;
  }

  if (this.type === 'exercise') {
    const id = this.items[0].id;
    this.exerciseService.getExerciseImages(id).subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.foundExerciseImage = data[0];
        } else {
          this.foundExerciseImage = null;
        }
      },
      (error: any) => {
        console.error('Error fetching exercise images:', error);
        this.foundExerciseImage = null;
      }
    );
    }

  }
}