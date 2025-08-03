import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';
import { InfoCardComponent } from '../../components/info-card/info-card.component';
import { MotivationComponent } from '../../components/motivation/motivation.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InfoCardComponent, MotivationComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent implements OnInit, OnDestroy {
  randomMotivation: any;
  isMobile: boolean = window.innerWidth < 576;
  showFilters: boolean = false;

  motivations = [
    {
      text: "“Success is doing what you have to do, even when you don’t feel like it.”",
      author: '@Daniël Storm',
      image: 'images/daniel.png'
    },
    {
      text: "“Discipline is choosing between what you want now and what you want most.”",
      author: '@Sven Richter',
      image: 'images/sven.png'
    },
    {
      text: "“Your body can stand almost anything. It’s your mind you have to convince.”",
      author: '@Noah de Vries',
      image: 'images/noah.png'
    }
  ];

  form = new FormGroup({
    query: new FormControl(''),
    targetMuscleGroup: new FormControl(''),
    difficulty: new FormControl('')
  });

  get query() {
    return this.form.get('query');
  }

  difficulties: any[] = [];
  targetMuscleGroups: any[] = [];
  exercises: any[] = [];
  filteredExercises: any[] = [];

  constructor(
    private router: Router,
    private exerciseService: ExerciseService,
    private metaDataService: MetaDataService
  ) {}

  resizeHandler = () => this.isMobile = window.innerWidth < 576;

  ngOnInit() {
    window.addEventListener('resize', this.resizeHandler);
    this.randomMotivation = this.motivations[Math.floor(Math.random() * this.motivations.length)];

    this.metaDataService.getPressureTypes().subscribe({
      next: (data: any) => this.difficulties = data,
      error: (err) => console.error('Failed to load pressure types', err)
    });

    this.exerciseService.getExerciseCategories().subscribe({
      next: (data: any) => this.targetMuscleGroups = data,
      error: (err) => console.error('Failed to load exercise categories', err)
    });

    this.exerciseService.getExercises().subscribe({
      next: (data: any) => {
        this.exercises = data;
        this.filteredExercises = [...data];
      },
      error: (error) => console.error('Error fetching exercises:', error)
    });

    this.form.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  onSearchSubmit() {
    this.applyFilters();
  }

  resetFilters() {
    this.form.reset({
      query: '',
      targetMuscleGroup: '',
      difficulty: ''
    });
    this.filteredExercises = [...this.exercises];
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    const values = this.form.value;

    this.filteredExercises = this.exercises.filter(ex => {
      const matchesQuery =
        !values.query || ex.name?.toLowerCase().includes(values.query.toLowerCase());

      const matchesDifficulty =
        !values.difficulty || ex.pressure_id === Number(values.difficulty);

      const matchesTargetGroup =
        !values.targetMuscleGroup || ex.exercise_category_id === Number(values.targetMuscleGroup);

      return matchesQuery && matchesDifficulty && matchesTargetGroup;
    });
  }
}
