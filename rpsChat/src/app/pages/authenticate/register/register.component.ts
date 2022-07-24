import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/User';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  userRegister(credentials: HttpParams) {
    this.authService.register(credentials).subscribe({
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
