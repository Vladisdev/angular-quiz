import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginResponseType } from '../../../../types/login-response.type';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/),
      Validators.required,
    ]),
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    if (this.loginForm.valid && this.email?.value && this.password?.value) {
      this.authService.login(this.email.value, this.password.value).subscribe({
        next: (data: LoginResponseType) => {
          if (
            data.error ||
            !data.accessToken ||
            !data.refreshToken ||
            !data.fullName ||
            !data.userId
          ) {
            this._snackBar.open('Ошибка при авторизации');
            throw new Error(
              data.message ? data.message : 'error with data on login'
            );
          }

          this.router.navigate(['/choice']);
        },
        error: (error: HttpErrorResponse) => {
          this._snackBar.open('Ошибка при авторизации');
          throw new Error(error.error.message);
        },
      });
    }
  }
}
