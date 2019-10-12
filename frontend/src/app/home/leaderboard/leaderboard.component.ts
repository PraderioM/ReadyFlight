import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StateService, Score} from '../../services/state.service';
import {ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
  providers: [StateService, HttpClient]
})

export class LeaderboardComponent implements OnInit {
  @Output() backToMenu = new EventEmitter<void>();
  @Input() token: string;

  scoreList: Score[];

  constructor(private stateService: StateService) {  }

  async back() {
    this.backToMenu.emit();
  }

  ngOnInit(): void {
    this.stateService.setToken(this.token);
    this.getScoreList();
  }

  async getScoreList() {
    this.scoreList = await this.stateService.getScores();
  }
}
