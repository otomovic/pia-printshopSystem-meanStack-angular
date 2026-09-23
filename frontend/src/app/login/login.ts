import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = ""
  password = ""
  message = "";
  userService = inject(UserService)
  router = inject(Router)
  login(){
    if(!this.username || !this.password){
      this.message = "Molimo Vas da unesete korisničko ime i lozinku!"
      return
    }
    this.userService.login(this.username, this.password).subscribe(user=>{
      if(user){
        if(!user.accepted){
          this.message = "Nalog nije prihvaćen od strane administratora!"
          return
        }
        else {
          if(user.type === 'admin'){
            this.message = "Prijava za administratore je na posebnoj stranici!"
            return
          }
          else {
            const profile = { ...user, password: '' }
            localStorage.setItem("loggedUser", JSON.stringify(profile))

            if(user.type === 'fizickoLice' || user.type === 'pravnoLice'){
              this.router.navigate(['/client']);
            }
            else{
              this.router.navigate(['/stampar']);
            }
          }
        }
      }
      else {
        this.message = "Pogrešno korisničko ime ili lozinka!"
      }
    })
  }
}
