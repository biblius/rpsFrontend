import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn!: boolean;
  loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor(private http: HttpClient) {
    this.checkLogIn()
    console.log(this.loggedIn)
    console.log(this.isLoggedIn)
  }

  login(credentials: HttpParams): Observable<any> {
    return this.http.post<string>(environment.apiUrl + '/login', credentials.toString(), { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') })
  }

  register(credentials: HttpParams): Observable<any> {
    return this.http.post<string>(environment.apiUrl + '/register', credentials.toString(), { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') })
  }

  logout(): Observable<any> {
    sessionStorage.clear();
    this.isLoggedIn = false;
    return this.http.get(environment.apiUrl + '/logout');
  }

  getAuthorizationToken(): string | null {
    return sessionStorage.getItem('id')
  }

  setAuthorizationToken(id: string): void {
    sessionStorage.setItem('id', id)
  }

  checkLogIn() {
    if (sessionStorage.getItem('id')) {
      this.isLoggedIn = true;
    }
    else {
      this.isLoggedIn = false;
    }
    this.loggedIn.next(this.isLoggedIn);
  }

}
