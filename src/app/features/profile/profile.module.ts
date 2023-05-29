import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './profile.component';
import { PlayerComponent } from 'src/app/pages/player/player.component';

@NgModule({
  declarations: [ProfileComponent, PlayerComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent,
      },
    ]),
  ],
})
export class ProfileModule {}
