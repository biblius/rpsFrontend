import { RpsService } from '../../../services/rps.service';
import { ChatUser } from '../../../../interfaces/chatUser';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../services/message.service';
import { RPS } from 'src/interfaces/rps';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rps-game',
  templateUrl: './rps-game.component.html',
  styleUrls: ['./rps-game.component.css']
})
export class RpsGameComponent implements OnInit {
  @Input() activeUser!: ChatUser
  @Input() rpsGame!: RPS;

  rps?: 'r' | 'p' | 's' | 'x';

  showOpponentChoices: boolean = false;
  choiceFinalized: boolean = false;
  showWinnerBanner: boolean = false;
  winners?: string[];
  winnerSub: Subscription;
  resetSub: Subscription;

  choices?: [string, 'r' | 'p' | 's' | 'x'][];
  choicesSub: Subscription;

  delSub!: Subscription;
  timeOut: number = 1500;

  pauseChoice: boolean = false;
  secretWord: string = '';
  kamenNajjaci: boolean = false;

  constructor(private rpsService: RpsService, private messageService: MessageService) {
    this.winnerSub = this.rpsService.winnerSubject.subscribe(winners => {
      this.winners = winners;
      this.showWinnerBanner = true;
      this.pauseChoice = true;
    })

    this.choicesSub = this.rpsService.choiceSubject.subscribe(choices => {
      this.choices = Array.from(choices.entries());
    })

    this.resetSub = this.rpsService.resetSubject.subscribe(rps => {
      this.rpsGame = rps;
      delete this.rps;
      delete this.winners;
      delete this.choices;
      this.choiceFinalized = false;
      this.showWinnerBanner = false;
      this.pauseChoice = false;
    })
  }

  ngOnInit(): void {
    this.checkFinalized();
    this.rps = this.rpsGame.choices.get(this.activeUser.id);
    console.log('RPSC -- USER IS :', this.userIs())
  }

  chooseRPS(choice: 'r' | 'p' | 's' | 'x'): void {
    if (!this.pauseChoice && !this.choiceFinalized) {
      if (this.rps == choice) {
        delete this.rps;
        return;
      }
      this.rps = choice;
      if (this.rpsGame.fastMode) {
        this.submitRPS();
      }
    }
  }

  submitRPS(): void {
    if (this.rps && !this.choiceFinalized) {
      this.rpsGame.choices.set(this.activeUser.id, this.rps);
      this.rpsService.chooseRPS(this.rps, this.rpsGame.id);
      this.choiceFinalized = true;
    }
  }

  getUsername(playerId: string): string {
    return this.messageService.getUsername(playerId);
  }

  getChoice(playerId: string): 'r' | 'p' | 's' | 'x' | undefined {
    return this.rpsGame.choices.get(playerId);
  }


  getScore(playerId: string): number {
    return this.rpsGame.scores.get(playerId)!;
  }

  displayWinnerNames(winners: string[] | undefined): string {
    if (!winners) {
      return '';
    }
    if (winners.length === 0) {
      return 'It\'s a draw!';
    }
    const names = this.messageService.getUsernames(winners);
    const message = names.length > 1 ? names.join(', ') + ' win!' : names.join('') + ' wins!';
    return message;
  }

  isActive(playerId: string): boolean {
    if (playerId === this.activeUser.id) {
      return true;
    }
    return false;
  }

  isInGame(user: ChatUser): boolean {
    return this.rpsGame.playerIds.has(user.id);
  }

  isConnected(user: ChatUser): boolean {
    return this.rpsGame.connections.has(user.id);
  }

  checkConnections(): boolean {
    let bool = true;
    this.rpsGame.playerIds.forEach((playerId) => {
      if (!this.rpsGame.connections.has(playerId)) {
        bool = false;
      }
    })
    return bool;
  }

  userIs(): 'host' | 'player' | undefined {
    const active = this.activeUser;
    if (active.id === this.rpsGame.host) {
      return 'host';
    }
    if (this.isInGame(active)) {
      return 'player';
    }
    return undefined;
  }

  toggleFast() {
    if (this.activeUser.id === this.rpsGame.host) {
      this.rpsService.toggleFastMode(this.rpsGame.id);
    }
  }

  onKey(event: KeyboardEvent) {
    if (this.rpsGame.fastMode && !this.choiceFinalized) {
      this.checkSecret(event.key)
    }

    switch (event.key) {
      case '1':
        this.chooseRPS('r')
        break;
      case '2':
        this.chooseRPS('p')
        break;
      case '3':
        this.chooseRPS('s')
        break;
      default:
        break;
    }
  }


  checkSecret(key: string) {
    const secret = 'kamenajjaci';
    this.secretWord += key;
    const regex = new RegExp(this.secretWord);
    console.log(this.secretWord)
    if (!regex.test(secret)) {
      this.secretWord = '';
      return;
    }
    if (this.secretWord === secret) {
      this.kamenNajjaci = !this.kamenNajjaci;
      console.log('kamen activated')
    }
  }

  checkFinalized() {
    this
  }

  acceptChallenge(gameId: string) {
    this.rpsService.acceptChallenge(gameId);
  }

  spectateGame(): void {
    //this.messageService.spectateGame(this.rpsGame.id)
  }
}
