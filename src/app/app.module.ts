import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AuthButtonsComponent } from './components/auth-buttons/auth-buttons.component';
import { CallbackModule } from './features/callback/callback.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { PlayerComponent } from './pages/player/player.component';

@NgModule({
  declarations: [AppComponent, AuthButtonsComponent, PlayerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot({
      ...env.auth0,
    }),
    SharedModule,
    CallbackModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
