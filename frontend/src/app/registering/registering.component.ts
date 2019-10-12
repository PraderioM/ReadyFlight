import {Component, EventEmitter, OnInit, Output} from '@angular/core';


@Component({
  selector: 'app-registering',
  templateUrl: './registering.component.html',
  styleUrls: ['./registering.component.css']
})
export class RegisteringComponent implements OnInit {
  @Output() loggedIn = new EventEmitter<string>();
  registering = false;

  ngOnInit() {
  }

  logIn(token: string) {
    this.loggedIn.emit(token);
  }

  goToLogin() {
    this.registering = false;
  }

  goToRegistering() {
    this.registering = true;
  }

}
