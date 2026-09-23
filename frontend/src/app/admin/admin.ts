import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserType } from '../models/user';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  userService = inject(UserService);
  router = inject(Router)
  unacceptedUsers: UserType[] = [];
  acceptedUsers: UserType[] = [];
  editUsername: string | null = null;
  message = '';

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.userService.getUnacceptedUsers().subscribe(users => {
      this.unacceptedUsers = users;
    });

    this.userService.getAcceptedUsers().subscribe(users => {
      this.acceptedUsers = users;
    });
  }

  acceptUser(username: string) {
    this.userService.acceptUser(username).subscribe(() => {
      this.ucitaj();
    });
  }

  rejectUser(username: string) {
    this.userService.rejectUser(username).subscribe(() => {
      this.ucitaj();
    });
  }

  urediKorisnika(username: string) {
    this.editUsername = username;
  }

  otkaziUredjivanje() {
    this.editUsername = null;
    this.ucitaj();
  }

  sacuvajKorisnika(user: UserType) {
    let podaci = new FormData();
    podaci.append('username', user.username);
    podaci.append('firstname', user.firstname);
    podaci.append('lastname', user.lastname);
    podaci.append('phone', user.phone);
    podaci.append('email', user.email);

    this.userService.updateProfile(podaci).subscribe({
      next: () => {
        this.message = 'Korisnik je izmenjen.';
        this.editUsername = null;
        this.ucitaj();
      },
      error: () => {
        this.message = 'Greška prilikom izmene korisnika.';
      }
    });
  }

  obrisiKorisnika(username: string) {
    if (!confirm(`Da li ste sigurni da želite da obrišete korisnika ${username}?`)) {
      return;
    }

    this.userService.deleteUser(username).subscribe(() => {
      this.ucitaj();
    });
  }

  logout(){
    localStorage.removeItem("loggedUser")
    this.router.navigate([''])
  }

  tipNaloga(tip: string): string {
    if (tip === 'fizickoLice') return 'Fizičko lice';
    if (tip === 'pravnoLice') return 'Pravno lice';
    if (tip === 'stamparija') return 'Štamparija';
    if (tip === 'admin') return 'Administrator';
    return tip;
  }
}
