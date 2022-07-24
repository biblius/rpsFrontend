import { ChatUser } from 'src/interfaces/chatUser';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-dash',
  templateUrl: './user-dash.component.html',
  styleUrls: ['./user-dash.component.css']
})
export class UserDashComponent implements OnInit {
  @Input() user!: ChatUser;
  @Output() onDeleteUser: EventEmitter<ChatUser> = new EventEmitter;

  constructor() { }

  ngOnInit(): void {
  }

  onDelete(user: ChatUser) {
    console.log(user)
    this.onDeleteUser.emit(user)
  }
}
