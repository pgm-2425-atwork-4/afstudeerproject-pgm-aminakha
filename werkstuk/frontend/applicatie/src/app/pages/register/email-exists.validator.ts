import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export function emailExistsValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return authService.checkEmailExists(control.value).pipe(
      map((exists: boolean) => (exists ? { emailTaken: true } : null)),
      catchError(() => of(null)) // geen error gooien als de backend crasht
    );
  };
}