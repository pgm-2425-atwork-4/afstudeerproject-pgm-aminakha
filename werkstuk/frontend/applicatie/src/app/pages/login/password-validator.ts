import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export function passwordValidator(authService: AuthService, getEmail: () => string): AsyncValidatorFn {
    return (control: AbstractControl) => {
        const password = control.value;
        const email = getEmail();

        if (!email || !password) {
        return of(null);
        }

        return authService.checkPasswordValid(email, password).pipe(
        map(isValid => (isValid ? null : { invalidPassword: true })),
        catchError(() => of(null))
        );
    };
}
