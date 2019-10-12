import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {StateService} from '../../services/state.service';
import {ConfigService} from '../../services/config.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() registered = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  registerFailed = false;
  private possibleLanguages = new ConfigService().possibleLanguages;

  constructor(private stateService: StateService) { }

  ngOnInit() {
  }

  async tryRegister(name: string, password: string, confirmPassword: string, languageIndex: number) {
    if (name === '') {
      this.registerFailed = true;
      alert('Please insert name.');
      return;
    } else if (password === '') {
      this.registerFailed = true;
      alert('Please insert password.');
      return;
    } else if (password !== confirmPassword) {
      this.registerFailed = true;
      alert('Passwords do not match.');
      return;
    }

    const language = this.possibleLanguages[languageIndex];
    const errorMessage = await this.stateService.register(name, password, language);
    const token = this.stateService.getToken();
    if (token != null) {
      this.registered.emit(token);
      console.log('Successfully logged out');
    } else {
      this.registerFailed = true;
      alert(errorMessage);
    }
  }

  goBack() {
    this.back.emit();
  }
}
