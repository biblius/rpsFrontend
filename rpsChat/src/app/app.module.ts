import { environment } from '../environments/environment';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors/0-index';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ButtonComponent } from './components/button/button.component';
import { UsersComponent } from './components/users/users.component';
import { UserDashComponent } from './components/user-dash/user-dash.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { AboutComponent } from './pages/about/about/about.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/authenticate/login/login.component';
import { RegisterComponent } from './pages/authenticate/register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatUserDashComponent } from './components/chat/chat-user-dash/chat-user-dash.component';
import { RoomDashComponent } from './components/chat/room-dash/room-dash.component';
import { RpsGameComponent } from './components/chat/rps-game/rps-game.component';

const appRoutes: Routes = [
  { path: '', component: UsersComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ButtonComponent,
    UsersComponent,
    UserDashComponent,
    AddUserComponent,
    AboutComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    ChatComponent,
    ChatUserDashComponent,
    RoomDashComponent,
    RpsGameComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule, ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { useHash: false })
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
