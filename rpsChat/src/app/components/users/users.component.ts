import { HttpParams } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service'
import { ChatUser } from 'src/interfaces/chatUser';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: ChatUser[] = [];
  errorMessage?: string;
  showAddUser!: boolean;
  showAddUserSub!: Subscription;
  userSub!: Subscription;

  constructor(private usersService: UsersService, private uiService: UiService) {
    this.showAddUserSub = this.uiService.addUserSubject.subscribe(response => this.showAddUser = response)
  }

  ngOnInit(): void {
    this.userSub = this.usersService.getUsers().subscribe({
      next: (response) => this.users = response,
      error: (error) => this.errorMessage = error.statusText
    });
  }
  
  toggleAddUser() {
    this.uiService.toggleAddUser();
  }
}
