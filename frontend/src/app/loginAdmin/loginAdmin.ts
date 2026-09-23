import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './loginAdmin.html',
  styleUrl: './loginAdmin.css',
})
export class LoginAdmin {
  username = ""
  password = ""
  message = "";
  userService = inject(UserService)
  router = inject(Router)
  login(){
    this.userService.loginAdmin(this.username, this.password).subscribe(user=>{
      if(user && user.type === 'admin'){
        localStorage.setItem("loggedUser", JSON.stringify({username: user.username, type: user.type}))
        this.router.navigate(['/admin'])
      }
      else if(user && user.type !== 'admin'){
        this.message = "Niste administrator!"
      }
      else this.message = "Pogrešan username ili password!"
    })
  }
}
