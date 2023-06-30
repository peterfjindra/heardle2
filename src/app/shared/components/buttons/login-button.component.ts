import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'login-button',
  template: `
    <button mat-raised-button color="primary" class="button__login" (click)="handleLogin()">Log In</button>
  `,
})
export class LoginButtonComponent {
  constructor(private auth: AuthService) {}

  handleLogin(): void {
    this.auth.loginWithRedirect({
      appState: {
        target: '/profile',
        returnTo: '/profile',
      },
    });
  }
}
