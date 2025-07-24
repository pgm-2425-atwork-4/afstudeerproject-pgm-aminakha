import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';
@Component({
  selector: 'app-exercises',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent {
  randomMotivation: any;
  motivations = [
    {
      text: "“Success is doing what you have to do, even when you don’t feel like it.”",
      author: '@Daniël Storm',
      image: '/images/daniel.png'
    }, 
    {
      text: "“Discipline is choosing between what you want now and what you want most.”",
      author: '@Sven Richter',
      image: '/images/sven.png'
    },
    {
      text: "“Your body can stand almost anything. It’s your mind you have to convince.”",
      author: '@Noah de Vries',
      image: '/images/noah.png'
  }];
  form = new FormGroup({
    query: new FormControl('', Validators.required),
    targetMuscleGroup: new FormControl(''),
    difficulty: new FormControl(''),
  });
  difficulties : any;
  targetMuscleGroups: any;
  exercises: any;
  constructor(private router: Router, private exerciseService: ExerciseService, private metaDataService: MetaDataService) {}
  ngOnInit() {
    this.randomMotivation = this.motivations[Math.floor(Math.random() * this.motivations.length)];
    this.metaDataService.getPressureTypes().subscribe((data: any) => {
      this.difficulties = data;
      console.log('Fetched difficulties:', this.difficulties);
      
    }); 
    this.exerciseService.getExerciseCategories().subscribe((data: any) => {
      this.targetMuscleGroups = data;
      console.log('Fetched target muscle groups:', this.targetMuscleGroups);
    });
    this.exerciseService.getExercises().subscribe((data: any) => {
      this.exercises = data;
      console.log('Fetched exercises:', this.exercises);
    }, error => {
      console.error('Error fetching exercises:', error);
    });
  }
  onSearchSubmit() {
      const searchValue = this.form.get('query')?.value?.trim();
      if (searchValue) {
        this.router.navigate(['/gyms'], { queryParams: { search: searchValue } });
      }
    }
    resetFilters() {
    this.form.reset();
  }
}
