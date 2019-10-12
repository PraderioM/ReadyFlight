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
  private showMultiPlayer = false;
  private showSinglePlayer = false;
  private showLoading = false;
  private showLeaderBoard = false;

  hideAll() {
    this.showMultiPlayer = false;
    this.showSinglePlayer = false;
    this.showLoading = false;
    this.showLeaderBoard = false;
  }

  constructor(private stateService: StateService) {  }

  async multiPlayer() {
    // Show loading component while looking for a game.
    this.hideAll();
    this.showLoading = true;

    // Look for a game.
    await this.stateService.setToken(this.token);
    await this.stateService.enterGame();

    // Show game once game is found.
    this.hideAll();
    this.showMultiPlayer = true;
  }

  async singlePlayer() {
    // Enter single player name.
    this.hideAll();
    this.showSinglePlayer = true;
  }

  async scores() {
    // Show leader board and hide everything else.
    this.hideAll();
    this.showLeaderBoard = true;
  }

  async changeLanguage(language: string) {
    await this.stateService.setToken(this.token);
    await this.stateService.changeLanguage(language);
    console.log('Language changed.');
  }

  async logOut() {
    this.loggedOut.emit();
    await this.stateService.setToken(this.token);
    this.stateService.logout();
  }

  // This function is used for coming back from scores or game.
  onBackToMenu() {
    this.hideAll();
  }

}
