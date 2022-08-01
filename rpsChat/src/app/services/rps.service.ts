import { MessageService } from 'src/app/services/message.service';
import { RPSData, RpsResolve } from '../../interfaces/rps';
import { WsMessage } from '../../interfaces/messages';
import { SocketService } from './socket.service';
import { Subject, BehaviorSubject, } from 'rxjs';
import { Injectable } from "@angular/core";
import { RPS, RPSManager } from 'src/interfaces/rps';

@Injectable({
  providedIn: 'root'
})
export class RpsService {

  rpsRooms: Map<string, RPS> = new Map();
  rpsRoomsSubject = new BehaviorSubject<Map<string, RPS>>(this.rpsRooms);

  choiceSubject = new Subject<Map<string, 'r' | 'p' | 's' | 'x'>>();
  resolveSubject = new Subject<RpsResolve>();
  ggSubject = new Subject<boolean>();
  resetSubject = new Subject<RPS>();
  excludeSubject = new Subject<string[]>();

  constructor(private socketService: SocketService, private messageService: MessageService) {
    const ez = socketService.ez();

    ez.register('rps', (message: WsMessage<RPS>) => {
      const data: RPSData = message.data;
      if (data.Update) {
        const event = data.Update.event;
        const game = this.rpsRooms.get(data.Update.game_id)!;
        console.log('%crps -- event', 'background: #FA8; color: #000', event);

        if (event.PlayerConnected) {
          const playerId = event.PlayerConnected
          game.connections.add(playerId);
        }

        if (Object.keys(event)[0] === 'FastToggled') {
          const value = event.FastToggled!;
          game.fastMode = value;
        }

        if (event.Choices) {
          for (const [playerId, choice] of event.Choices) {
            game.choices.set(playerId, choice);
          }
          this.choiceSubject.next(game.choices);
        }

        if (event.Exclude) {
          const excluded = event.Exclude;
          for (const id of excluded) {
            game.excluded.add(id)
          }
          this.resolveSubject.next({ Exclude: excluded });
          this.resetChoices(game);
        }

        if (event.Winner) {
          const winner = event.Winner;
          this.resolveSubject.next({ Winner: winner });

          let score = game.scores.get(winner)!;
          game.scores.set(winner, score + 1);
          
          game.excluded.clear();
          this.resetChoices(game)
        }

        if (event.GG) {
          game.gameOver = true;
          this.ggSubject.next(true)
        }
        console.log('%crps -- state', 'background: #FA8; color: #000', game);
      }

      if (data.State) {
        const game = this.socketService.convertToCamel(data.State);
        this.rpsRooms.set(game.id, RPSManager.hash(game));
        console.log('SET ROOM : ', this.rpsRooms)
        this.rpsRoomsSubject.next(this.rpsRooms);
      }

      if (data.Rooms) {
        const rooms: RPS[] = this.socketService.convertBulkToCamel(data.Rooms);
        console.log('RPS GOT ROOMS : ', rooms);
        for (const room of rooms) {
          this.rpsRooms.set(room.id, RPSManager.hash(room));
        }
      }
    })
  }

  private resetChoices(game: RPS) {
    game.choices.clear();
    setTimeout(() => {
      this.resetSubject.next(game);
    }, game.fastMode ? 750 : 1500);
  }

  sendChallenge(players: string[], gg_score: number) {
    this.socketService.ez().send('rps', { Init: { host: this.socketService.getId(), players, gg_score } });
  }

  acceptChallenge(gameId: string) {
    this.socketService.send('rps', { Action: { game_id: gameId, sender_id: this.socketService.getId(), action: 'Join' } });
  }

  toggleFastMode(gameId: string) {
    this.socketService.send('rps', { Action: { game_id: gameId, sender_id: this.socketService.getId(), action: { FastMode: !this.rpsRooms.get(gameId)!.fastMode } } });
  }

  spectateGame(gameId: string) {
    // this.socket.emit('rps spectate', gameId);
  }

  chooseRPS(choice: 'r' | 'p' | 's' | 'x', gameId: string) {
    this.socketService.send('rps', { Action: { game_id: gameId, sender_id: this.socketService.getId(), action: { Choose: choice } } })
  }
}