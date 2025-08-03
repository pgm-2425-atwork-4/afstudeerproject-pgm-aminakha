import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';
import { MetaDataService } from '../../services/meta-data.service';

@Component({
  selector: 'app-admin-add-exercise',
  standalone: true,
  templateUrl: './admin-add-exercise.component.html',
  styleUrls: ['./admin-add-exercise.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminAddExerciseComponent implements OnInit {
  editingExercise: any = null;
  exercises: any[] = [];

  form = new FormGroup({
      name: new FormControl<string>('', Validators.required),
      exercise_category_id: new FormControl<number | null>(null, Validators.required),
      pressure_id: new FormControl<number | null>(null, Validators.required),
      big_description: new FormControl<string>('', Validators.required),
      duration: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  selectedImages: File[] = [];
  categories: any[] = [];
  pressures: any[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(
    private exerciseService: ExerciseService,
    private metaDataService: MetaDataService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPressures();
    this.loadExercises();
  }

  loadExercises() {
  this.exerciseService.getExercises().subscribe({
    next: (data: any) => {
      this.exercises = data;
    },
    error: (err) => {
      console.error('🔥 Fout bij opnieuw ophalen van oefeningen:', err);
    }
  });
}
  loadCategories() {
    this.exerciseService.getExerciseCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (err) => {
        console.error("🔥 Fout bij ophalen categorieën:", err);
        this.errorMessage = 'Fout bij laden van categorieën.';
      }
    });
  }

  loadPressures() {
    this.metaDataService.getPressureTypes().subscribe({
      next: (data: any) => {
        this.pressures = data;
      },
      error: (err) => {
        console.error("🔥 Fout bij ophalen druktypes:", err);
        this.errorMessage = 'Fout bij laden van druktypes.';
      }
    });
  }

  onImagesSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
  }

  addExercise() {
    if (this.form.invalid || this.selectedImages.length === 0) {
      this.errorMessage = 'Vul alle velden in en selecteer minimaal één afbeelding.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');
    formData.append('exercise_category_id', this.form.value.exercise_category_id?.toString() ?? '');
    formData.append('pressure_id', this.form.value.pressure_id?.toString() ?? '');
    formData.append('big_description', this.form.value.big_description ?? '');
    formData.append('duration', this.form.value.duration?.toString() ?? '');

    this.selectedImages.forEach((image) => {
      formData.append('images', image);
    });

    this.exerciseService.addExercise(formData).subscribe({
      next: () => {
        this.successMessage = '✅ Oefening succesvol toegevoegd!';
        this.errorMessage = '';
        this.form.reset();
        this.selectedImages = [];
      },
      error: (err) => {
        console.error("🔥 Fout bij toevoegen oefening:", err);
        this.successMessage = '';
        this.errorMessage = '❌ Toevoegen mislukt.';
      }
    });
  }
  deleteExercise(id: number) {
  if (confirm('Weet je zeker dat je deze oefening wilt verwijderen?')) {
    this.exerciseService.deleteExercise(id).subscribe({
      next: () => {
        alert('✅ Oefening succesvol verwijderd');
        this.loadExercises();
      },
      error: (err) => {
        console.error("🔥 Fout bij verwijderen oefening:", err);
        alert('❌ Verwijderen mislukt');
      }
    });
  }
}
  editExercise(exercise: any) {
    this.editingExercise = { ...exercise };

    this.form.patchValue({
      name: exercise.name,
      exercise_category_id: exercise.exercise_category_id,
      pressure_id: exercise.pressure_id,
      big_description: exercise.big_description,
      duration: exercise.duration,
    });

    // Reset eventuele geselecteerde nieuwe afbeeldingen
    this.selectedImages = [];
  }
 updateExercise() {
  if (!this.editingExercise || !this.form.value) return;

  const { name, exercise_category_id, pressure_id, big_description, duration } = this.form.value;
  const formData = new FormData();

  if (name && name.trim() !== '') {
    formData.append('name', name);
  }

  if (exercise_category_id !== null && exercise_category_id !== undefined) {
    formData.append('exercise_category_id', exercise_category_id.toString());
  }

  if (pressure_id !== null && pressure_id !== undefined) {
    formData.append('pressure_id', pressure_id.toString());
  }

  if (big_description && big_description.trim() !== '') {
    formData.append('big_description', big_description);
  }

  if (duration !== null && duration !== undefined) {
    formData.append('duration', duration.toString());
  }

  this.selectedImages.forEach(image => {
    formData.append('images', image);
  });

  this.exerciseService.updateExercise(this.editingExercise.id, formData).subscribe({
    next: () => {
      alert('✅ Oefening succesvol bijgewerkt!');
      this.resetForm();
      this.loadExercises();
    },
    error: (err) => {
      console.error("🔥 Fout bij bijwerken oefening:", err);
      alert('❌ Bijwerken mislukt');
    }
  });
}


  resetForm() {
  this.form.reset();
  this.selectedImages = [];
}
}
