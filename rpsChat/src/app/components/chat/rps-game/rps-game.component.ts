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
  showResolveBanner: boolean = false;
  resolveMessage?: string;
  resolveSub: Subscription;
  resetSub: Subscription;
  ggSub: Subscription;
  showGgBanner: boolean = false;
  ggBanner: string = 'It was a glorious battle';

  choices?: [string, 'r' | 'p' | 's' | 'x'][];
  choicesSub: Subscription;

  pauseChoice: boolean = false;
  secretWord: string = '';
  kamenNajjaci: boolean = false;

  constructor(private rpsService: RpsService, private messageService: MessageService) {
    // When the winner is resolved, all players are included back to the game
    // and the winner's username is displayed
    this.resolveSub = this.rpsService.resolveSubject.subscribe(resolve => {

      let displayMessage: string = '';

      // Upon resolving each game, if the game has more than 2 players and more than 1 winner,
      // put the losers in the excluded array until there's only 1 winner 
      if (resolve.Exclude) {
        if (resolve.Exclude.length === 0) {
          displayMessage = 'You all suck!';
        } else {
          for (const id of resolve.Exclude) {
            this.rpsGame.excluded.add(id);
          }
          const usernames = messageService.getUsernames(resolve.Exclude);
          displayMessage = usernames.join(',') + ' need(s) to eat plenty more beans!';
        }
      }
      if (resolve.Winner) {
        displayMessage = messageService.getUsername(resolve.Winner) + ' wins!';
        this.rpsGame.excluded.clear();
      }
      this.resolveMessage = displayMessage;
      this.showResolveBanner = true;
      this.pauseChoice = true;
    })

    // Received when all players have chosen, used only to the display each player's choice
    // on game resolve
    this.choicesSub = this.rpsService.choiceSubject.subscribe(choices => {
      this.choices = Array.from(choices.entries());
    })

    // Triggers shortly after the choices message is sent. Resets all utilites for displaying 
    // the winner and player choices.
    this.resetSub = this.rpsService.resetSubject.subscribe(rps => {
      this.rpsGame = rps;
      delete this.rps;
      delete this.resolveMessage;
      delete this.choices;
      this.choiceFinalized = false;
      this.showResolveBanner = false;
      this.pauseChoice = false;
    })

    this.ggSub = this.rpsService.ggSubject.subscribe(_ => {
      this.rpsGame.gameOver = true;
    })
  }

  ngOnInit(): void {
    this.checkFinalized();
    this.rps = this.rpsGame.choices.get(this.activeUser.id);
    if (this.rpsGame.gameOver) {
      this.showGgBanner = true;
    }
    
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

  displayWinnerName(winner: string | undefined): string | undefined {
    if (winner) {
      const name = this.messageService.getUsername(winner);
      const message = name + ' wins!';
      return message;
    }
    return;
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

  isExcluded(playerId: string): boolean {
    return this.rpsGame.excluded.has(playerId);
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
