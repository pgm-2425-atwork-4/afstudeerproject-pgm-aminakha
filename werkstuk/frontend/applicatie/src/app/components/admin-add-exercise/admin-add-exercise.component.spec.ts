import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddExerciseComponent } from './admin-add-exercise.component';

describe('AdminAddExerciseComponent', () => {
  let component: AdminAddExerciseComponent;
  let fixture: ComponentFixture<AdminAddExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddExerciseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
