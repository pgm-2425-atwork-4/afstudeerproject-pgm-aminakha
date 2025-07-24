import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';
import { MetaDataService } from '../../services/meta-data.service';

@Component({
  selector: 'app-admin-add-exercise',
  templateUrl: './admin-add-exercise.component.html',
  styleUrls: ['./admin-add-exercise.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminAddExerciseComponent implements OnInit {
   form = new FormGroup({
    name: new FormControl('', Validators.required),
    exercise_category_id: new FormControl(null, Validators.required),
    pressure_id: new FormControl(null, Validators.required),
    big_description: new FormControl('', Validators.required),
    duration: new FormControl('', [Validators.required, Validators.min(1)]),
  });
  image : any = null;

  categories: any[] = []; 
  pressures: any[] = []; 
  selectedImages: File[] = [];
  constructor(private exerciseService: ExerciseService, private metaDataService: MetaDataService) {}

  ngOnInit(): void {

    this.exerciseService.getExerciseCategories().subscribe({
    next: (data) => {
      this.categories =  data as any[];
      console.log("✅ Exercise Categories:", this.categories);
    },
    error: (err) => {
      console.error("🔥 Error fetching categories:", err);
    }
  });

    this.metaDataService.getPressureTypes().subscribe({
      next: (pressures: any) => {
        this.pressures = pressures;
      },
      error: (err) => {
        console.error("🔥 Error fetching pressures:", err);
      }
    });
  }

  onImagesSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
  }

  addExercise() {
  const formData = new FormData();

  formData.append('name', this.form.value.name ?? '');
  formData.append('exercise_category_id', (this.form.value.exercise_category_id ?? '').toString());
  formData.append('pressure_id', (this.form.value.pressure_id ?? '').toString());
  formData.append('big_description', this.form.value.big_description ?? '');
  formData.append('duration', (this.form.value.duration ?? '').toString());

  if (this.selectedImages.length === 0) {
  alert('❌ Geen afbeelding(en) geselecteerd!');
  return;
  
}

  this.selectedImages.forEach(image => {
    formData.append('images', image);
  });

  this.exerciseService.addExercise(formData).subscribe({
    next: () => {
      alert('✅ Exercise added successfully!');
      this.form.reset();
    },
    error: (err) => {
      console.error("🔥 Error adding exercise:", err);
      alert('❌ Failed to add exercise');
    }
  });
}
}
