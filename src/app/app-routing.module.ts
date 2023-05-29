import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './features/profile/profile.component';

const routes: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   loadChildren: () =>
  //     import('./features/home/home.module').then((m) => m.HomeModule),
  // },
  // {
  //   path: 'profile',
  //   loadChildren: () =>
  //     import('./features/profile/profile.module').then((m) => m.ProfileModule),
  //   component: ProfileComponent,
  // },
  // {
  //   path: 'public',
  //   loadChildren: () =>
  //     import('./features/public/public.module').then((m) => m.PublicModule),
  // },
  // {
  //   path: 'protected',
  //   loadChildren: () =>
  //     import('./features/protected/protected.module').then(
  //       (m) => m.ProtectedModule
  //     ),
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () =>
  //     import('./features/admin/admin.module').then((m) => m.AdminModule),
  // },
  {
    path: 'callback',
    loadChildren: () =>
      import('./features/callback/callback.module').then(
        (m) => m.CallbackModule
      ),
  },
  // {
  //   path: '**',
  //   loadChildren: () =>
  //     import('./features/not-found/not-found.module').then(
  //       (m) => m.NotFoundModule
  //     ),
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
