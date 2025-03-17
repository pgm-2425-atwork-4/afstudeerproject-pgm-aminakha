import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddGymComponent } from './admin-add-gym.component';

describe('AdminAddGymComponent', () => {
  let component: AdminAddGymComponent;
  let fixture: ComponentFixture<AdminAddGymComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddGymComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddGymComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
