import {Component, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild, ElementRef, NgZone, HostListener} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EndGame, StateService} from '../../services/state.service';
import {stringify} from 'querystring';
import {isUndefined} from 'util';


export class PoliceMan {
  private readonly left: boolean;
  public x;
  private maxSpeed = 20;
  private hatColor = 'black';
  private bodyColor = 'blue';
  public z = 20;
  private zHat = 7;

  constructor(private ctx: CanvasRenderingContext2D, public y = 0) {
    this.left = Math.random() < 0.5;

    if (this.left) {
      this.x = 0;
    } else {
      this.x = this.ctx.canvas.width - this.z;
    }
  }

  move(vy: number) {
    let vx = 0;
    if (this.y > this.ctx.canvas.height / 2) {
      vx = Math.round(Math.random() * this.maxSpeed);
      // console.log('x speed', vx);
      if (!this.left) {
        vx = -vx;
      }

    }
    this.x += vx;
    this.y += vy;
    this.draw();
  }

  private draw() {
    if (this.left) {
      this.ctx.fillStyle = this.bodyColor;
      this.ctx.fillRect(this.x, this.y, this.z - this.zHat, this.z);
      this.ctx.fillStyle = this.hatColor;
      this.ctx.fillRect(this.x + this.z - this.zHat, this.y, this.zHat, this.z);
    } else {
      this.ctx.fillStyle = this.bodyColor;
      this.ctx.fillRect(this.x + this.zHat, this.y, this.z - this.zHat, this.z);
      this.ctx.fillStyle = this.hatColor;
      this.ctx.fillRect(this.x, this.y, this.zHat, this.z);
    }
  }

  isOutsideCanvas() {
    return this.y > this.ctx.canvas.height;
  }
}

export class Baby {
  private x = 0;
  private babyColor = '#ff9999';
  private backgroundColor = 'white';
  private textFont = '30px Arial';
  private cryColor = '';
  private height = 30;
  public z = 20;

  constructor(private ctx: CanvasRenderingContext2D, private y = 0) { }

  move(vy: number) {
    this.y += vy;
    this.draw();
  }

  private draw() {
    // Draw baby.
    this.ctx.fillStyle = this.babyColor;
    this.ctx.fillRect(this.x, this.y, this.z, this.z);

    // Draw cry panel.
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(this.z, this.y - this.height, this.ctx.canvas.width - this.z, this.height);

    // Draw cry text
    this.ctx.font = this.textFont;
    this.ctx.fillStyle = this.cryColor;
    this.ctx.fillText('Baby crying', this.ctx.canvas.width / 3, this.y - this.height);
  }

  isOutsideCanvas() {
    return (this.y - this.height) > this.ctx.canvas.height;
  }
}


export class Suitcase {
  public x;
  private maxW = 20;
  private maxH = 20;
  private minW = 5;
  private minH = 5;
  public height: number;
  public width: number;
  private color = '#772200';
  private bkgColor = 'white';

  constructor(private ctx: CanvasRenderingContext2D, public y = 0) {
    this.width = this.minW + Math.round((this.maxW - this.minW) * Math.random());
    this.height = this.minH + Math.round((this.maxH - this.minH) * Math.random());
    this.x = Math.round(Math.random() * this.ctx.canvas.width);
  }

  move(vy: number) {
    this.y += vy;
    this.draw();
  }

  private draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width , this.height);
    this.ctx.fillStyle = this.bkgColor;
    this.ctx.fillRect(this.x + this.width / 10, this.y + this.height / 10,  2 * this.width / 5, 8 * this.height / 10);
  }

  isOutsideCanvas() {
    return this.y > this.ctx.canvas.height;
  }
}

export class Player {
  public x;
  public y;
  public vx = 2;
  private color = 'black';
  private killingMoeColor = '#888888';
  private killingMoeIncrease = 1.1;

  constructor(private ctx: CanvasRenderingContext2D, public z = 20) {
    this.y = this.ctx.canvas.height - z;
    this.x = (this.ctx.canvas.width - z) / 2;
  }

  move(vx: number, vy: number = 0) {
    this.x += vx;
    this.y += vy;
  }

  draw(killingMoe: boolean = false) {
    // Draw killing Moe animation if needed.
    if (killingMoe) {
      this.ctx.fillStyle = this.killingMoeColor;
      const offset = this.z * (1 - this.killingMoeIncrease) / 2;
      const scale = this.z * this.killingMoeIncrease;
      this.ctx.fillRect(this.x - offset, this.y - offset, scale, scale);
    }

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.z, this.z);
  }
}


export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  A = 65,
  B = 66,
}


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [StateService, HttpClient]
})

export class GameComponent implements OnInit, OnDestroy {
  @Output() backToMenu = new EventEmitter<void>();
  @Input() token: string;
  @Input() singlePlayer: boolean;

  @ViewChild('mainScreen', { static: true }) mainScreen: ElementRef<HTMLCanvasElement>;
  @ViewChild('sideScreen', { static: true }) sideScreen: ElementRef<HTMLCanvasElement>;
  @ViewChild('progressScreen', { static: true }) progressScreen: ElementRef<HTMLCanvasElement>;

  possiblePlays: string[] = ['Bomb', 'Suitcase', 'Pee', 'Baby', 'KillMoe'];
  probReceivingPossiblePlay: number[] = [0.1, 0.2, 0.03, 0.05, 0.1];
  availablePlays: string[];
  started = false;

  textX = 100;
  textY = 50;
  textFont = '30px Arial';
  readyColor = 'red';
  flightColor = 'green';
  textColor = 'black';
  progressColor = 'gray';

  showMessage = '';

  position = 0;
  speed = 0.001;
  movingSpeed = 2;
  boostSpeedMultiplier = 1.5;
  boostSpeedMultiplierDuration = 20;
  boostSpeedMultiplierRemaining = 0;
  peeingRemaining = 0 ;
  maxPeeingDuration = 15;


  progress = this.singlePlayer ? 1 : 0;
  progressSpeed = 0.05;
  damage = 0.01;

  mainCtx: CanvasRenderingContext2D;
  sideCtx: CanvasRenderingContext2D;
  progressCtx: CanvasRenderingContext2D;

  animationId;
  interval;

  player: Player;
  policeMans: PoliceMan[] = [];
  policeManProb = 0.01;
  policeManProbSpeed = 0.01;
  endGameState = new EndGame();

  babies: Baby[] = [];
  babiesProb = 0.1;
  babiesProbSpeed = 0.1;

  suitcases: Suitcase[] = [];
  suitcasesProb = 0.1;
  suitcasesProbSpeed = 0.1;

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {

    // Do nothing if game hasn't started yet.
    if (!this.started) {
      return;
    }

    if (event.which === KEY_CODE.RIGHT_ARROW) {
      this.player.move(this.player.vx);
    } else if (event.which === KEY_CODE.LEFT_ARROW) {
      this.player.move(-this.player.vx);
    } else if (event.which === KEY_CODE.A) {
      if (this.availablePlays.length > 0) {
        this.stateService.addPlayToSend(this.availablePlays[0]);
        this.availablePlays.splice(0, 1);
      }
    } else if (event.which === KEY_CODE.B) {
      if (this.availablePlays.length > 0) {
        if (this.availablePlays[0] === 'Bomb') {
          this.policeManProb -= this.policeManProbSpeed;
          this.availablePlays.splice(0, 1);
        } else if (this.availablePlays[0] === 'Suitcase') {
          this.suitcasesProb -= this.suitcasesProbSpeed;
          this.availablePlays.splice(0, 1);
        } else if (this.availablePlays[0] === 'Baby') {
          this.babiesProb -= this.babiesProbSpeed;
          this.availablePlays.splice(0, 1);
        }
      }
    }
  }

  constructor(private stateService: StateService, private ngZone: NgZone) {  }

  ngOnInit() {
    // Init state service to enable communication with backend.
    this.stateService.setToken(this.token);

    // Init canvas context.
    this.mainCtx = this.mainScreen.nativeElement.getContext('2d');
    this.sideCtx = this.sideScreen.nativeElement.getContext('2d');
    this.progressCtx = this.progressScreen.nativeElement.getContext('2d');

    // Init player.
    this.player = new Player(this.mainCtx);
    this.player.draw();

    // Set countdown.
    this.startCountDown();

    // this.mainCtx.fillStyle = 'red';
    setTimeout(this.start.bind(this), 2000);
  }

  start() {
    this.started = true;
    this.ngZone.runOutsideAngular(() => this.updateMainCanvas());
    setInterval(() => {
      this.updateMainCanvas();
    }, 200);
  }

  startCountDown() {
    this.mainCtx.font = this.textFont;
    this.mainCtx.fillStyle = this.readyColor;
    this.mainCtx.fillText('Ready', this.textX, this.textY);

    setTimeout(this.flight.bind(this), 1000);

  }

  flight() {
    this.clearText();
    this.mainCtx.font = this.textFont;
    this.mainCtx.fillStyle = this.flightColor;
    this.mainCtx.fillText('Flight', this.textX, this.textY);
  }

  clearText() {
    this.mainCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height / 2);
  }

  updateMainCanvas() {
    if (this.peeingRemaining > 0) {
      this.peeingRemaining -= 1;

      // Clear everything.
      this.mainCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height);

      // Went to pee.
      this.mainCtx.font = this.textFont;
      this.mainCtx.fillStyle = 'black';
      this.mainCtx.fillText('Went to pee.', this.mainCtx.canvas.width / 3, 0);
      this.mainCtx.fillText('Couldn\'t pass bottle.', this.mainCtx.canvas.width / 3, this.mainCtx.canvas.height / 4);
    } else {
      // Check if game has ended.
      if (!this.singlePlayer) {
        this.updateProbsFromStateService();
        if (this.endGameState.end === true) {
          this.concludeMultiPlayerGame();
          return;
        }
      }

      // Clear everything.
      this.mainCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height);

      // Draw and check if a crush has taken place.
      // Draw suitcases.
      let i = 0;
      let nCollisions = 0;
      while (i < this.suitcases.length) {
        if (this.suitcases[i].isOutsideCanvas()) {
          this.suitcases.splice(i, 1);
        } else {
          this.suitcases[i].move(this.movingSpeed);
          const collided = this.hasCollided(this.suitcases[i].x, this.suitcases[i].y, this.suitcases[i].width, this.suitcases[i].height);
          nCollisions = collided ? nCollisions + 1 : nCollisions;
          if (collided) {
            this.suitcases.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      // If crash happened we add a new crash to the list.
      if (nCollisions > 0 && !this.singlePlayer) {
        this.stateService.addPlaySuffered('Bomb');
      }

      // Draw police Mans.
      i = 0;
      let newCollisions = 0;
      while (i < this.policeMans.length) {
        if (this.policeMans[i].isOutsideCanvas()) {
          this.policeMans.splice(i, 1);
        } else {
          this.policeMans[i].move(this.movingSpeed);
          const collided = this.hasCollided(this.policeMans[i].x, this.policeMans[i].y, this.policeMans[i].z, this.policeMans[i].z);
          newCollisions = collided ? nCollisions + 1 : nCollisions;
          if (collided) {
            this.policeMans.splice(i, 1);
          } else {
            i++;
          }
        }
      }
      nCollisions += newCollisions;
      // If crash happened we add a new crash to the list.
      if (newCollisions > 0 && !this.singlePlayer) {
        this.stateService.addPlaySuffered('Suitcase');
      }

      // Draw babies.
      i = 0;
      while (i < this.babies.length) {
        if (this.babies[i].isOutsideCanvas()) {
          this.babies.splice(i, 1);
        } else {
          this.babies[i].move(this.movingSpeed);
          i++;
        }
      }

      // Draw player.
      this.player.draw(this.boostSpeedMultiplierRemaining > 0);

      // Add new suitcases.
      let random = Math.random();
      if (random < this.suitcasesProb) {
        this.suitcases.push(new Suitcase(this.mainCtx));
      }

      // Add new police mans.
      random = Math.random();
      if (random < this.policeManProb) {
        this.policeMans.push(new PoliceMan(this.mainCtx));
      }

      // Add new babies.
      random = Math.random();
      if (random < this.babiesProb) {
        this.babies.push(new Baby(this.mainCtx));
      }

      // Update values differently depending on mode.
      this.progress = Math.max(0, this.progress - nCollisions * this.damage);
      if (this.singlePlayer) {  // Single player.
        if (this.boostSpeedMultiplierRemaining > 0) {
          this.position += this.speed * this.boostSpeedMultiplier;
          this.boostSpeedMultiplierRemaining -= 1;
        } else {
          this.position += this.speed;
        }
        this.showMessage = stringify(Math.round(this.position * 500));
        if (this.progress === 0) {
          this.showFinalScore();
          return;
        }
      } else {  // Multi player.
        this.progress = Math.min(this.progress + this.progressSpeed);
        if (nCollisions === 0) {
          this.position += this.speed;
        }

        // Add new available action to list of actions
        if (this.progress === 1 && this.singlePlayer) {
          this.addNewPlay();
          this.progress = 0;
        }
      }
    }

    // Update position
    this.stateService.setPosition(this.position);

    // Update progress rectangle.
    this.updateProgressBar();

    // Increase probabilities in single player mode.
    if (this.singlePlayer) {
      this.babiesProb += this.babiesProbSpeed;
      this.policeManProb += this.policeManProbSpeed;
      this.suitcasesProb += this.suitcasesProbSpeed;
    } else { // Probabilities in multiple players mode are computed differently according to rival.
      this.stateService.updateGameState().then( res => {
        this.endGameState = res;
      });
      this.updateSideCanvas();
    }

    // Draw available plays in single player mode.
    if (!this.singlePlayer) {
      this.drawAvailablePlays();
    }


    // Restart animation.
    this.animationId = requestAnimationFrame(() => this.updateMainCanvas.bind(this));
  }

  drawAvailablePlays(size: number = 10) {
    for (let i = 0; i < this.availablePlays.length; i++) {
      let color;
      const play = this.availablePlays[i];
      if (play === 'Bomb') {
        color = '#0000ff';
      } else if (play === 'Suitcase') {
        color = '#772200';
      } else if (play === 'Pee') {
        color = '#999900';
      } else if (play === 'Baby') {
        color = '#ff9999';
      } else if (play === 'KillMoe') {
        color = '#888888';
      } else {
        this.availablePlays.splice(i, 1);
        continue;
      }
      this.mainCtx.rect(this.mainCtx.canvas.width - (i + 1) * size, 0, size, size);

    }

  }

  addNewPlay() {
    let exit = false;
    while (true) {
      for (let i = 0; this.possiblePlays.length > i; i++) {
        if ( Math.random() < this.probReceivingPossiblePlay[i]) {
          this.availablePlays.push(this.possiblePlays[i]);
          exit = true;
          break;
        }
      }
      if (exit) {
        break;
      }
    }

  }

  private updateProgressBar() {
    this.progressCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height);
    this.progressCtx.fillStyle = this.progressColor;
    this.progressCtx.fillRect(0, 0, this.progress * this.progressCtx.canvas.width, this.progressCtx.canvas.height);
  }

  private hasCollided(x: number, y: number, w: number, h: number) {
    const xMax = Math.min(this.player.x + this.player.z, x + w);
    const xMin = Math.max(this.player.x, x);
    const yMax = Math.min(this.player.y + this.player.z, y + h);
    const yMin = Math.max(this.player.y, y);

    return yMax > yMin && xMax > xMin;
  }

  private showFinalScore() {
    // Clear everything and show final score.
    this.showMessage = 'Congratulations, you have reached a score of';
    this.mainCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height);
    this.mainCtx.font = this.textFont;
    this.mainCtx.fillStyle = this.textColor;
    this.mainCtx.fillText(stringify(Math.round(this.position * 500)), this.textX, this.textY);
  }

  back() {
    this.backToMenu.emit();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationId);
  }

  private updateSideCanvas() {
    this.sideCtx.clearRect(0, 0, this.sideCtx.canvas.width, this.sideCtx.canvas.height);
    this.sideCtx.fillStyle = 'black';
    this.sideCtx.rect(this.sideCtx.canvas.width / 2, (1 - this.stateService.getPosition()) * this.sideCtx.canvas.height,
      this.sideCtx.canvas.width / 2, this.stateService.getPosition() * this.sideCtx.canvas.height);
    this.sideCtx.fillStyle = 'red';
    this.sideCtx.rect(0, (1 - this.stateService.getOpponentPosition()) * this.sideCtx.canvas.height,
      this.sideCtx.canvas.width / 2, this.stateService.getOpponentPosition() * this.sideCtx.canvas.height);
  }

  private updateProbsFromStateService() {
    this.showPlaysAfflicted(this.stateService.getPlaysAfflicted());

    // Update probs.
    for (const play of this.stateService.getPlaysToReceive()) {
      if (play === 'Bomb') {
        this.policeManProb += this.policeManProbSpeed;
      } else if (play === 'Suitcase') {
        this.suitcasesProb += this.suitcasesProbSpeed;
      } else if (play === 'Pee') {
        this.peeingRemaining += this.maxPeeingDuration;
      } else if (play === 'Baby') {
        this.babiesProb += this.babiesProbSpeed;
      } else if (play === 'KillMoe') {
        this.boostSpeedMultiplierRemaining += this.boostSpeedMultiplierDuration;
      }
    }
  }

  async showPlaysAfflicted(plays: string[]) {
    if (plays.length > 0) {
      this.showMessage = plays[0];
      setTimeout(function() {
        this.showPlaysAfflicted(plays.slice(1));
      }.bind(this), 50);
    }
  }

  private concludeMultiPlayerGame() {
    this.sideCtx.clearRect(0, 0, this.sideCtx.canvas.width, this.sideCtx.canvas.height);
    if (this.endGameState.error === true) {
      if (!isUndefined(this.endGameState.message)) {
        alert(this.endGameState.message);
      } else {
        alert('Some error occurred.');
      }
    } else if (this.endGameState.won === true) {
      alert('Congratulations, you have won THE GAME.');
    } else {
      alert('I\'m sorry YOU LOST that flight with no refund.');
    }
  }
}
