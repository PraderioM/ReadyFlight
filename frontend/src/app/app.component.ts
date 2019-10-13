import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StateService} from './services/state.service';
import {ConfigService} from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [StateService, HttpClient, ConfigService]
})
export class AppComponent implements OnInit, OnDestroy {
  token?: string;
  loggedIn = false;

  bgIndex = 0;
  nBackgrounds = 6;
  interval;

  buttonText = 'Hide background';
  viewBackground = true;

  logIn(token: string) {
    this.token = token;
    this.loggedIn = true;
  }

  logOut() {
    this.loggedIn = false;
  }

  ngOnInit() {
    this.interval = setInterval(() => {
      this.updateBackground();
    }, 12000);
  }

  updateBackground() {
    this.bgIndex++;
    this.bgIndex = this.bgIndex % this.nBackgrounds;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  changeBackgroundVisibility() {
    if (this.viewBackground) {
      this.viewBackground = false;
      this.buttonText = 'Show background';
    } else {
      this.viewBackground = true;
      this.buttonText = 'Hide background';
    }
  }
}
