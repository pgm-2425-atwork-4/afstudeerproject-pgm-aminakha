import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';
import { MetaDataService } from '../../services/meta-data.service';

@Component({
  selector: 'app-admin-add-exercise',
  templateUrl: './admin-add-exercise.component.html',
  styleUrls: ['./admin-add-exercise.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminAddExerciseComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    exercise_category_id: new FormControl<number | null>(null, Validators.required),
    pressure_id: new FormControl<number | null>(null, Validators.required),
    big_description: new FormControl<string>('', Validators.required),
    duration: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

  categories: any[] = [];
  pressures: any[] = [];
  selectedImages: File[] = [];
  selectedExerciseId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private exerciseService: ExerciseService,
    private metaDataService: MetaDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMetaData();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.selectedExerciseId = +idParam;
      this.isEditMode = true;
      this.loadExercise(this.selectedExerciseId);
    }
  }

  loadMetaData() {
    this.exerciseService.getExerciseCategories().subscribe((data: any) => {
  this.categories = data;
});

    this.metaDataService.getPressureTypes().subscribe({
      next: (data: any[]) => (this.pressures = data),
      error: (err) => console.error('🔥 Fout bij ophalen pressures:', err)
    });
  }

  loadExercise(id: number) {
    this.exerciseService.getExerciseById(id.toString()).subscribe({
      next: (exercise: any) => {
        this.form.patchValue({
          name: exercise.name,
          exercise_category_id: exercise.exercise_category_id,
          pressure_id: exercise.pressure_id,
          big_description: exercise.big_description,
          duration: exercise.duration
        });
      },
      error: (err) => {
        console.error('🔥 Fout bij ophalen oefening:', err);
        alert('❌ Oefening niet gevonden.');
      }
    });
  }

  onImagesSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
  }

  onSubmit() {
    if (this.isEditMode && this.selectedExerciseId !== null) {
      this.updateExercise(this.selectedExerciseId);
    } else {
      this.addExercise();
    }
  }

  addExercise() {
    const formData = this.buildFormData();

    if (this.selectedImages.length === 0) {
      alert('❌ Geen afbeelding(en) geselecteerd!');
      return;
    }

    this.selectedImages.forEach((image) =>
      formData.append('images', image)
    );

    this.exerciseService.addExercise(formData).subscribe({
      next: () => {
        alert('✅ Oefening succesvol toegevoegd!');
        this.form.reset();
      },
      error: (err) => {
        console.error('🔥 Fout bij toevoegen oefening:', err);
        alert('❌ Toevoegen mislukt');
      }
    });
  }

  updateExercise(id: number) {
    const formData = this.buildFormData();

    this.selectedImages.forEach((image) =>
      formData.append('images', image)
    );

    this.exerciseService.updateExercise(id, formData).subscribe({
      next: () => {
        alert('✅ Oefening succesvol bijgewerkt!');
        this.router.navigate(['/admin/exercises']);
      },
      error: (err) => {
        console.error('🔥 Fout bij bijwerken oefening:', err);
        alert('❌ Bijwerken mislukt');
      }
    });
  }

  buildFormData(): FormData {
    const formData = new FormData();
    const val = this.form.value;

    formData.append('name', val.name ?? '');
    formData.append('exercise_category_id', val.exercise_category_id?.toString() ?? '');
    formData.append('pressure_id', val.pressure_id?.toString() ?? '');
    formData.append('big_description', val.big_description ?? '');
    formData.append('duration', val.duration?.toString() ?? '');

    return formData;
  }
}
