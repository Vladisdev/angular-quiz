import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignupResponseType } from '../../../../types/signup-response.type';
import { LoginResponseType } from '../../../../types/login-response.type';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  signupForm = new FormGroup({
    name: new FormControl('', [
      Validators.pattern(/^[А-Я][а-я]+\s*$/),
      Validators.required,
    ]),
    lastName: new FormControl('', [
      Validators.pattern(/^[А-Я][а-я]+\s*$/),
      Validators.required,
    ]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/),
      Validators.required,
    ]),
    agree: new FormControl(false, [Validators.required]),
  });

  get name() {
    return this.signupForm.get('name');
  }

  get lastName() {
    return this.signupForm.get('lastName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  signup(): void {
    if (
      this.signupForm.valid &&
      this.name?.value &&
      this.lastName?.value &&
      this.email?.value &&
      this.password?.value
    ) {
      this.authService
        .signup(
          this.name.value,
          this.lastName.value,
          this.email.value,
          this.password.value
        )
        .subscribe({
          next: (data: SignupResponseType) => {
            if (data.error || !data.user) {
              this._snackBar.open('Ошибка при авторизации');
              throw new Error(
                data.message ? data.message : 'error with data on signup'
              );
            }

            if (this.email?.value && this.password?.value) {
              this.authService
                .login(this.email.value, this.password.value)
                .subscribe({
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

                    this.authService.setUserInfo({
                      fullName: data.fullName,
                      userId: data.userId,
                      email: this.email?.value as string,
                    });
                    this.authService.setTokens(
                      data.accessToken,
                      data.refreshToken
                    );

                    this.router.navigate(['/choice']);
                  },
                  error: (error: HttpErrorResponse) => {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error(error.error.message);
                  },
                });
            }
          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при регистрации');
            throw new Error(error.error.message);
          },
        });
    }
  }
}
