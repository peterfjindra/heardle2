import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginButtonComponent } from './components/buttons/login-button.component';
import { SignupButtonComponent } from './components/buttons/signup-button.component';
import { LogoutButtonComponent } from './components/buttons/logout-button.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [
    LoginButtonComponent,
    SignupButtonComponent,
    LogoutButtonComponent,
  ],
  imports: [CommonModule, MaterialModule],
  exports: [LoginButtonComponent, SignupButtonComponent, LogoutButtonComponent, MaterialModule],
})
export class SharedModule {}
