import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { LoginButtonComponent } from './components/buttons/login-button.component';
import { LogoutButtonComponent } from './components/buttons/logout-button.component';

@NgModule({
  declarations: [
    LoginButtonComponent,
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
    LogoutButtonComponent,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
  ],
})
export class SharedModule {}
