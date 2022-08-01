import { RpsService } from '../../services/rps.service';
import { Room, isInstanceOfRoom } from 'src/interfaces/room';
import { ChatUser, isInstanceOfChatUser } from 'src/interfaces/chatUser';
import { RPS, isInstanceOfRPS } from 'src/interfaces/rps';
import { ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { trigger, style, animate, transition, stagger, query } from '@angular/animations';
import { ChatMessage } from '../../../interfaces/messages';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('toggleBox', [
      transition(':enter', [
        style({
          width: '0%'
        }),
        animate("100ms 100ms", style({ width: '100%' }))
      ]),
      transition(':leave', [
        style({
          width: '100%'
        }),
        animate("100ms 100ms", style({ width: '0%' }))
      ])
    ]),

    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: '0%'
        }),
        animate("100ms 200ms", style({ opacity: '1' }))
      ]),
      transition(':leave', [
        style({
          opacity: '100%'
        }),
        animate("100ms", style({ opacity: '0' }))
      ]),
    ]),

    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: '0%'
          }),
          stagger(100, [
            animate('0.2s', style({ opacity: 1 }))
          ])
        ], { optional: true }),
        query(':leave', [
          style({
            opacity: '100%'
          }),
          stagger(100, [
            animate('0.2s', style({ opacity: 0 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})


export class ChatComponent implements OnInit {
  @ViewChild('messageList') messageList!: ElementRef;

  isInstanceOfChatUser = isInstanceOfChatUser;
  isInstanceOfRoom = isInstanceOfRoom;
  isInstanceOfRPS = isInstanceOfRPS;

  newRoomName!: string;

  activeUser!: ChatUser
  challengedUsers: string[] = [];

  messages: ChatMessage[] = [];
  messageSub!: Subscription;

  users: ChatUser[] = [];
  userMap: Map<string, ChatUser> = new Map();
  chatUsersSubscription!: Subscription;
  
  selected?: ChatUser | Room;
  selectedRPS?: RPS;

  rooms!: Map<string, Room>;
  roomsSub!: Subscription;

  rpsRooms!: Map<string, RPS>;
  rpsRoomsSub!: Subscription;
  ggScoreSelector: number = 3;

  showChat: boolean = false;
  showGame: boolean = false;
  showRoomForm: boolean = false;

  constructor(private messageService: MessageService, private rpsService: RpsService) { }


  ngOnInit(): void {

    this.chatUsersSubscription = this.messageService.usersSubject.subscribe(users => {
      if (users.size > 0) {
        for (const [id, user] of users.entries()) {
          if (user.active) {
            this.activeUser = user;
          }
          if (!this.userMap.has(id)) {
            this.userMap.set(id, user);
            this.users.push(user);
            this.users = this.sendActiveToTop(this.users);
          }
        }
      }
    })

    this.messageSub = this.messageService.messageSubject.subscribe(messages => {
      if (this.selected) {
        this.messages = messages;
        if (this.messageList) {
          this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
        }
      }
    })

    this.roomsSub = this.messageService.publicRoomsSubject.subscribe((rooms) => {
      this.rooms = rooms;
    })

    this.rpsRoomsSub = this.rpsService.rpsRoomsSubject.subscribe(rooms => {
      this.rpsRooms = rooms;
      if (this.selectedRPS) {
        this.selectedRPS = this.rpsRooms.get(this.selectedRPS.id);
      }
    })
  }

  toggleRoomForm(): void {
    this.showRoomForm = !this.showRoomForm;
  }

  toggleSelected(selected: string) {

    // Toggle RPS off if already selected
    if (this.rpsRooms.has(selected)) {
      if (this.rpsRooms.get(selected) === this.selectedRPS) {
        delete this.selectedRPS;
        this.showGame = false;
        return;
      }
    }

    // Toggle user/room off if selected
    if (this.userMap.has(selected) && this.userMap.get(selected) === this.selected ||
      this.rooms.has(selected) && this.rooms.get(selected) === this.selected) {
      delete this.selected;
      this.messageService.select(undefined);
      this.messages = [];
      this.showChat = false;
      return;
    }

    // Select user
    if (this.userMap.has(selected)) {
      this.messages = [];
      const user = this.userMap.get(selected)!;
      this.selected = user;
      this.messageService.select(user);
      this.removeMessageNotification(user);
      this.showChat = true;
      this.displayMessages();
      return;
    }

    // Select room
    if (this.rooms.has(selected)) {
      this.messages = [];
      const room = this.rooms.get(selected)!;
      this.selected = room;
      this.messageService.select(room);
      this.showChat = true;
      if (room.users.find((id) => id === this.activeUser.id)) {
        this.displayMessages();
      }
      return;
    }

    // Select RPS
    if (this.rpsRooms.has(selected)) {
      const game = this.rpsRooms.get(selected)!;
      this.selectedRPS = game;
      this.showGame = true;
    }
  }

  /**
   * Returns an array of tuples in the form of `[userId, ChatUser]`
   * @returns {[string, ChatUser][]}
   */
  getUserEntries(): [string, ChatUser][] {
    return Array.from(this.userMap.entries());
  }

  /**
 * Returns an array of tuples in the form of `[roomId, Room]`
 * @returns {[string, ChatUser][]}
 */
  getRoomEntries(): [string, Room][] {
    return Array.from(this.rooms.entries());
  }

  /**
 * Returns an array of tuples in the form of `[rpsId, RPS]`
 * @returns {[string, RPS][]}
 */
  getRPSEntries(): [string, RPS][] {
    return Array.from(this.rpsRooms.entries());
  }

  /********************* ROOMS ********************/
  createRoom() {
    if (this.newRoomName) {
      this.showRoomForm = false;
      this.messageService.createPublicRoom(this.newRoomName);
    }
    this.newRoomName = '';
  }

  joinRoom(roomId: string) {
    if (!this.isInRoom(this.rooms.get(roomId)!)) {
      this.messageService.joinRoom(roomId);
    }
  }

  leaveRoom(roomId: string) {
    console.log('LEAVING ROOM : ', roomId);
    if (this.selected === this.rooms.get(roomId)!) {
      this.selected = undefined;
    }
    this.messageService.leaveRoom(roomId)
  }

  isInRoom(room: Room): boolean {
    if (room.users.find((id) => id === this.activeUser.id)) {
      return true;
    }
    return false;
  }

  /*************MESSAGES*********************/


  displayMessages() {
    this.messageService.updateMessages();
  }

  removeMessageNotification(user: ChatUser) {
    user.hasNewMessages = false;
  }

  /**
 * Utility for sorting the active user to the top of the users list.
 * @param users The currently connected users
 * @returns The sorted users
 */
  private sendActiveToTop(users: ChatUser[]): ChatUser[] {
    const values = users.sort((a, b) => {
      if (a.active) return -1;
      if (b.active) return 1;
      if (a.username < b.username) return -1
      return a.username > b.username ? 1 : 0;
    })
    return values;
  }
}


