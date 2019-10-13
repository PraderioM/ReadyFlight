import { BrowserModule } from '@angular/platform-browser';
import {NgModule, OnDestroy, OnInit} from '@angular/core';

import { AppComponent } from './app.component';
import {RegisteringComponent} from './registering/registering.component';
import {LoginComponent} from './registering/login/login.component';
import {RegisterComponent} from './registering/register/register.component';
import {HomeComponent} from './home/home.component';
import {HttpClientModule} from '@angular/common/http';
import {LeaderboardComponent} from './home/leaderboard/leaderboard.component';
import {GameComponent} from './home/game/game.component';
import {LoadingComponent} from './home/loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisteringComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    LeaderboardComponent,
    GameComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
