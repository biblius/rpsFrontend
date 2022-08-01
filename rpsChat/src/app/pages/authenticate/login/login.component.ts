import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message?: string;
  showAddUser!: boolean;

  loggedInSub!: Subscription

  constructor(private authService: AuthService, private router: Router) {
    this.loggedInSub = this.authService.loggedIn.subscribe(
      loggedIn => {
        if (loggedIn)
          this.router.navigateByUrl('/');
        return;
      }
    )
    this.authService.checkLogIn();
  }

  ngOnInit(): void { }

  userLogin(credentials: HttpParams) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.ok) {
          this.authService.setAuthorizationToken(response.session_id);
          this.router.navigateByUrl('/');
        }
      },
      error: (error) => console.log(error),
      complete: () => {
        console.log('Successfully logged in!')
        this.authService.checkLogIn();
      }
    })
  }
}
