import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';
import { InfoCardComponent } from '../../components/info-card/info-card.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InfoCardComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent implements OnInit {
  randomMotivation: any;
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
    query: new FormControl('', Validators.required),
    targetMuscleGroup: new FormControl(''),
    difficulty: new FormControl('')
  });

  difficulties: any[] = [];
  targetMuscleGroups: any[] = [];
  exercises: any[] = [];
  filteredExercises: any[] = [];

  constructor(
    private router: Router,
    private exerciseService: ExerciseService,
    private metaDataService: MetaDataService
  ) {}

  ngOnInit() {
    this.randomMotivation = this.motivations[Math.floor(Math.random() * this.motivations.length)];
    this.metaDataService.getPressureTypes().subscribe((data: any) => {
      this.difficulties = data;
    });

    this.exerciseService.getExerciseCategories().subscribe((data: any) => {
      this.targetMuscleGroups = data;
    });

    this.exerciseService.getExercises().subscribe({
      next: (data: any) => {
        this.exercises = data;
        console.log(this.exercises[0]);

        this.filteredExercises = data;
      },
      error: (error) => console.error('Error fetching exercises:', error)
    });

    this.form.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  onSearchSubmit() {
    this.applyFilters();
  }

  resetFilters() {
    this.form.reset();
    this.filteredExercises = [...this.exercises];
  }

  applyFilters() {
  const values = this.form.value;

  this.filteredExercises = this.exercises.filter(ex => {
    return (
      (!values.query || ex.name?.toLowerCase().includes(values.query.toLowerCase())) &&
      (!values.difficulty || ex.pressure_id === Number(values.difficulty)) &&
      (!values.targetMuscleGroup || ex.exercise_category_id === Number(values.targetMuscleGroup))
    );
  });
}
}
