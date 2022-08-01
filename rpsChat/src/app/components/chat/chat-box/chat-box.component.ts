import { RpsService } from './../../../services/rps.service';
import { ChatMessage } from './../../../../interfaces/messages';
import { MessageService } from './../../../services/message.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatUser, isInstanceOfChatUser } from 'src/interfaces/chatUser';
import { isInstanceOfRoom, Room } from 'src/interfaces/room';
import { isInstanceOfRPS } from 'src/interfaces/rps';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {
  @Input() activeUser!: ChatUser;
  @Input() selected?: ChatUser | Room;
  @Input() messages: ChatMessage[] = [];
  @Input() ggScoreSelector!: number;
  @Input() isInRoom!: Function;
  @Input() getRPSEntries!: Function;

  isInstanceOfChatUser = isInstanceOfChatUser;
  isInstanceOfRoom = isInstanceOfRoom;
  isInstanceOfRPS = isInstanceOfRPS;

  messageContent!: string;

  constructor(private messageService: MessageService, private rpsService: RpsService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if (this.selected) {
      this.messageService.sendMessage(this.messageContent, this.selected.id);
      this.messageContent = '';
    }
  }

  sendChallenge() {
    if (this.selected && this.selected != this.activeUser) {
      if (isInstanceOfChatUser(this.selected)) {
        this.rpsService.sendChallenge([this.activeUser.id, this.selected.id], this.ggScoreSelector);
      } else if (this.isInstanceOfRoom(this.selected)) {
        this.rpsService.sendChallenge(this.selected.users, this.ggScoreSelector);
      }
    }
  }

  // challengeExists(userId: string): boolean {
  //   for (const [_, room] of this.getRPSEntries()) {
  //     if(room.playerIds.length > 2) {

  //     }
  //     if (room.playerIds.has(userId) && room.playerIds.has(this.activeUser.id)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

}
