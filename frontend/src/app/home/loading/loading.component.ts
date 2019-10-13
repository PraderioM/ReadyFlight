import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StateService} from '../../services/state.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  providers: [StateService, HttpClient]
})

export class LoadingComponent {
  private char = '.';
  private loadingMessageList: string[] = [];
  private index = 0;
  private maxIndex = 5;
  private showMessage: string;

  constructor() {
    // Create loading messages.
    for (let i = 0; i < this.maxIndex; i++) {
      let newLoadingMessage = 'Loading';
      this.showMessage = newLoadingMessage;
      for (let j = 0; j < i; j++) {
        newLoadingMessage = newLoadingMessage + this.char;
      }
      this.loadingMessageList.push(newLoadingMessage);
    }

    // Initialize show message and start loop for viewing it as changing.
    setInterval(this.updateShowMessage.bind(this), 1500);
  }

  // Increase index of showed message.
  updateShowMessage() {
    this.index ++;
    this.index = this.index % this.maxIndex;
    this.showMessage = this.loadingMessageList[this.index];
  }
}
