import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { ChatUser } from 'src/interfaces/chatUser';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(environment.apiUrl + '/users');
  }
  deleteUser(user: ChatUser): Observable<ChatUser> {
    return this.http.delete<ChatUser>(environment.apiUrl + '/users/' + user.id);
  }
}
