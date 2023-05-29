import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'callback',
  templateUrl: './callback.component.html',
})
export class CallbackComponent {

  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(private authService:AuthService) {

  }
}
