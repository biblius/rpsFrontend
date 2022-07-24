import { RPSMessage } from '../../interfaces/messages';
import { WsMessage } from '../../interfaces/messages';
import { SocketService } from './socket.service';
import { EZSocket } from '../../../../ezSocket/ezSocket';
import { ChatUser } from '../../interfaces/chatUser'
import { Room } from '../../interfaces/room'
import { UsersService } from './users.service';
import { Subject, BehaviorSubject, } from 'rxjs';
import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { RPS, RPSManager } from 'src/interfaces/rps';
import { RPSData } from '../../interfaces/messages';

@Injectable({
  providedIn: 'root'
})
export class RpsService {

  rpsRooms: Map<string, RPS> = new Map();
  rpsRoomsSubject = new BehaviorSubject<Map<string, RPS>>(this.rpsRooms);

  choiceSubject = new Subject<Map<string, 'r' | 'p' | 's' | 'x'>>();
  winnerSubject = new Subject<string[] | undefined>();
  resetSubject = new Subject<RPS>();

  constructor(private socketService: SocketService) {
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

        if (event.Winners) {
          const winners = event.Winners;
          this.winnerSubject.next(winners);
          for (const winner of winners) {
            let score = game.scores.get(winner)!;
            game.scores.set(winner, score + 1);
          }
          game.choices.clear();
          setTimeout(() => {
            this.resetSubject.next(game);
          }, game.fastMode ? 750 : 1500);
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


  sendChallenge(players: string[]) {
    this.socketService.ez().send('rps', { Init: { host: this.socketService.getId(), players } });
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

  resetChoices(roomId: string) {
    // this.socket.emit('rps reset', roomId)
  }
}
  //   this.socket.on('rps rooms', rpsRooms => {
  //     this.rpsRooms = rpsRooms;
  //     this.rpsRoomsSubject.next(this.rpsRooms);
  //   })