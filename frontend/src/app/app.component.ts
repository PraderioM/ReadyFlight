import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StateService} from './services/state.service';
import {ConfigService} from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [StateService, HttpClient, ConfigService]
})
export class AppComponent {
  title = 'ready-flight';
  token?: string;
  loggedIn = false;

  logIn(token: string) {
    this.token = token;
    this.loggedIn = true;
  }

  logOut() {
    this.loggedIn = false;
  }
}
