import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {StateService} from '../../services/state.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() login = new EventEmitter<string>();
  @Output() register = new EventEmitter<void>();
  logInFailed = false;

  constructor(private stateService: StateService) { }

  ngOnInit() {
  }

  async tryLogIn(name: string, password: string) {
    if (name === '') {
      this.logInFailed = true;
      alert('Please insert a name.');
      return;
    } else if (password === '') {
      this.logInFailed = true;
      alert('Please insert a password.');
      return;
    }

    const errorMessage = await this.stateService.login(name, password);
    const token = this.stateService.getToken();

    if (token != null) {
      console.log('Successfully logged in.');
      this.login.emit(token);
    } else {
      alert(errorMessage);
      this.logInFailed = true;
    }
  }

  changeToRegistering() {
    this.register.emit();
  }

}
