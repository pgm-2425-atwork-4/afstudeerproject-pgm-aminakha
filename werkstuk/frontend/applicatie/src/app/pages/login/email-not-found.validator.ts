// login/email-not-found.validator.ts
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { catchError, map, of } from 'rxjs';

export function emailNotFoundValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const email = control.value;

    if (!email || control.invalid) return of(null);

    return authService.checkEmailExists(email).pipe(
      map((exists: boolean) => (exists ? null : { emailNotFound: true })),
      catchError(() => of(null)) // Of toon andere foutmelding
    );
  };
}
