import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './shared/auth/login/login.component';
import { SobreMiComponent } from './components/sobre-mi/sobre-mi.component';
import { GestionUserComponent } from './components/gestion-user/gestion-user.component';
import { GestionarMicuentaComponent } from './components/gestionar-micuenta/gestionar-micuenta.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sobreMi',
    component: SobreMiComponent
  },
    {
    path: 'gestionUser',
    component: GestionUserComponent
  },
  {
    path: 'gestionarMiCuenta',
    component: GestionarMicuentaComponent
  },
  {
    path: 'ias',
    loadChildren: () => import('./components/ias/ias.module').then(m => m.IasModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
