import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'info-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css'
})
export class InfoCardComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() type: string = '';
  @Input() deleteSavedExercise: boolean = false;
  @Input() deleteGym: boolean = false;
  @Input() userId: any;

  popularGyms: any[] = [];

  constructor(private exerciseService: ExerciseService, private gymService: GymService) {}

  ngOnInit() {
    this.processItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] || changes['type']) {
      this.processItems();
    }
  }

  processItems() {
    if (Array.isArray(this.items) && Array.isArray(this.items[0])) {
      this.items = this.items[0]; // Flatten als geneste array
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
      this.items.forEach((exercise: any) => {
        const id = exercise.id;
        this.exerciseService.getExerciseImages(id).subscribe(
          (data: any) => {
            exercise.image = Array.isArray(data) && data.length > 0 ? data[0].image_url : null;
          },
          (error: any) => {
            console.error(`❌ Error loading image for exercise ${id}:`, error);
            exercise.image = null;
          }
        );
      });
    }
  }

  getTruncatedHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.slice(0, 20) + '...';
  }

  deleteExercise(id: string) {
    console.log(`🗑️ Deleting exercise with ID: ${id}`);
    this.exerciseService.deleteSavedExercise(this.userId, id).subscribe({
      next: () => {
        console.log(`✅ Successfully deleted exercise with ID: ${id}`);
        this.items = this.items.filter(item => item.id !== id);
        this.processItems(); // Refresh lijst
      },
      error: (error) => {
        console.error(`❌ Error deleting exercise with ID: ${id}`, error);
      }
    });
  }

  deleteSavedGym(gymId: string) {
    if (!this.userId) {
      console.error("❌ No user ID available");
      return;
    }

    this.gymService.deleteSavedGym(this.userId, gymId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gym deleted:", res);
        this.items = this.items.filter(gym => gym.id !== gymId);
        this.processItems(); // Refresh lijst
        alert("Gym deleted successfully!");
      },
      error: (err) => {
        console.error("🔥 Error deleting gym:", err);
        alert("Failed to delete gym.");
      }
    });
  }
}
