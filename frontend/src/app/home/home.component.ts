import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StateService} from '../services/state.service';
import {ConfigService} from '../services/config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [StateService, HttpClient]
})
export class HomeComponent {
  @Output() loggedOut = new EventEmitter<void>();
  @Input() token: string;
  private possibleLanguages = new ConfigService().possibleLanguages;

  constructor(private stateService: StateService) {  }

  async play() {
    // Todo implement.
    await this.stateService.setToken(this.token);
    console.log('You are playing congrats.');
  }

  async scores() {
    // Todo implement.
    await this.stateService.setToken(this.token);
    console.log('This are the scores.');
  }

  async changeLanguage(language: string) {
    await this.stateService.setToken(this.token);
    this.stateService.changeLanguage(language);
    // Todo implement.
    console.log('Language changed.');
  }

  async logOut() {
    this.loggedOut.emit();
    await this.stateService.setToken(this.token);
    this.stateService.logout();
  }
}
