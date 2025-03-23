import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddExerciseCategoryComponent } from './admin-add-exercise-category.component';

describe('AdminAddExerciseCategoryComponent', () => {
  let component: AdminAddExerciseCategoryComponent;
  let fixture: ComponentFixture<AdminAddExerciseCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddExerciseCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddExerciseCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
