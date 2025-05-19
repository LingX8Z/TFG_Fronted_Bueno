import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './shared/auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SobreMiComponent } from './components/sobre-mi/sobre-mi.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptor/interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { IAsComponent } from './components/ias/ias.component';
import { IasModule } from './components/ias/ias.module';
import { GestionUserComponent } from './components/gestion-user/gestion-user.component';
import { GestionarMicuentaComponent } from './components/gestionar-micuenta/gestionar-micuenta.component';
import { ErrorComponent } from './components/error/error.component';
import { PagoPremiumComponent } from './components/pago-premium/pago-premium.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SobreMiComponent,
    GestionUserComponent,
    GestionarMicuentaComponent,
    ErrorComponent,
    PagoPremiumComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    RouterModule,
    FormsModule,
    IasModule,
    ReactiveFormsModule, 
    HttpClientModule
  ],
  providers: [  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
