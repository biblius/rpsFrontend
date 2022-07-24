import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/User';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  @Output() onSubmitCredentials: EventEmitter<HttpParams> = new EventEmitter;

  credentialsForm = this.formBuilder.group({
    username: '',
    password: ''
  });

  subscription!: Subscription;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {

  }

  submitCredentials() {
    if (!this.credentialsForm.get('username')!.value || !this.credentialsForm.get('password')!.value) {
      alert('Cannot create user without username/password');
      return;
    }
    const credentials = new HttpParams()
      .set('username', this.credentialsForm.get('username')!.value)
      .set('password', this.credentialsForm.get('password')!.value)
    this.onSubmitCredentials.emit(credentials)
  }

}
