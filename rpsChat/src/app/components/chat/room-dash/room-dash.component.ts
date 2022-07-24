import { MessageService } from 'src/app/services/message.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChatUser } from '../../../../interfaces/chatUser';
import { Room } from '../../../../interfaces/room';

@Component({
  selector: 'app-room-dash',
  templateUrl: './room-dash.component.html',
  styleUrls: ['./room-dash.component.css']
})
export class RoomDashComponent implements OnInit {
  @Input() room!: Room;
  @Input() activeUser!: ChatUser

  constructor(private messageService: MessageService) { }

  getUsernames(): string {
    const names = this.messageService.getUsernames(this.room.users);
    return names.join(', ');
  }

  ngOnInit(): void { }

}
