import {Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
// import {Sequence} from '../models/models';
import {HttpClient, HttpParams} from '@angular/common/http';


export interface GameState {
    token?: string;
    position: number;
    opponentPosition: number;
    playsToSend: string[];
    playsToReceive: string[];
    playsSuffered: string[];
    playsAfflicted: string[];
}

class EndGame {
  public end: boolean;
  public won?: boolean;
  public error?: boolean;
  public message?: string;
}

class GameResponse {
  public position: number;
  public newPlaysToReceive: string[];
  public newPlaysAfflicted: string[];
  public endGame: EndGame;
}

class LoginResponse {
  public token?: string;
  public message: string;
}

class Score {
  name: string;
  score: number;
}

@Injectable()
export class StateService {
    private currentState: GameState;

    urlPath = 'http://0.0.0.0:2121';

    constructor(private http: HttpClient) {
        this.currentState = {
            token: null,
            position: 0,
            opponentPosition: 0,
            playsToSend: [],
            playsToReceive: [],
            playsSuffered: [],
            playsAfflicted: []
            };
    }

    // region logging.
    async login(name: string, password: string) {
      console.log('Logging in');
      const response = await this.http
        .get<LoginResponse>(this.urlPath + '/login',
          {params: new HttpParams().set('name', name).set('password', password)})
        .toPromise();

      this.currentState.token = response.token;
      return response.message;
    }

    async logout() {
      console.log('Logging out');
      await this.http
        .get(this.urlPath + '/logout',
          {params: new HttpParams().set('token', this.currentState.token)}
          )
        .toPromise();

      this.currentState.token = null;

      console.log('Successfully logged out');
    }

    async register(name: string, password: string, language: string) {
      console.log('Registering out');
      const response = await this.http
        .get<LoginResponse>(this.urlPath + '/register',
          {params: new HttpParams().set('name', name).set('password', password).set('language', language)})
        .toPromise();
      console.log(response);

      this.currentState.token = response.token;
      return response.message;
    }

    async changeLanguage(language: string) {
      this.http
        .get(this.urlPath + '/change_language',
          {params: new HttpParams().set('token', this.currentState.token).set('language', language)})
        .toPromise();
    }

    getToken() {
      return this.currentState.token;
    }

    setToken(token: string) {
      this.currentState.token = token;
    }
    // endregion.

    // region game.
    async enterGame() {
      return await this.http
        .get<number>(this.urlPath + '/start_game',
          {params: new HttpParams().set('token', this.currentState.token)})
        .toPromise();
    }


    async updateGameState() {
      const playsToSend = this.currentState.playsToSend;
      this.currentState.playsToSend = [];
      const playsSuffered = this.currentState.playsSuffered;
      this.currentState.playsSuffered = [];

      const response = await this.http.post<GameResponse>(this.urlPath + '/update_game',
        {
          position: this.currentState.position,
          plays_to_send: playsToSend,
          plays_suffered: playsSuffered,
          token: this.currentState.token
        }).toPromise();

      this.currentState.opponentPosition = response.position;
      this.currentState.playsAfflicted.concat(response.newPlaysAfflicted);
      this.currentState.playsAfflicted.concat(response.newPlaysToReceive);

      return response.endGame;
    }
    // endregion.

    // region scores.
    async getScores(name: string, password: string, language: string) {
      const token = this.currentState.token;
      return await this.http
        .get<Score[]>(this.urlPath + '/get_scores',
          {params: new HttpParams().set('token', token)})
        .toPromise();
    }
    // endregion.
}
