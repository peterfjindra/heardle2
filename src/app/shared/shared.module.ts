import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { LoginButtonComponent } from './components/buttons/login-button.component';
import { LogoutButtonComponent } from './components/buttons/logout-button.component';
import { SignupButtonComponent } from './components/buttons/signup-button.component';

@NgModule({
  declarations: [
    LoginButtonComponent,
    SignupButtonComponent,
    LogoutButtonComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
  ],
  exports: [
    LoginButtonComponent,
    SignupButtonComponent,
    LogoutButtonComponent,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
  ],
})
export class SharedModule {}
