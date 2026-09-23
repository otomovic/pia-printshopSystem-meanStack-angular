import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserType } from '../models/user';

@Component({
  selector: 'app-stampar',
  imports: [FormsModule, RouterLink],
  templateUrl: './stampar.html',
  styleUrl: './stampar.css',
})
export class Stampar implements OnInit {
  private userService = inject(UserService);
  router = inject(Router)

  currentUser: UserType = new UserType();
  newPassword = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  ngOnInit() {
    const stored = localStorage.getItem("loggedUser")
    if(!stored){
      this.router.navigate(['login'])
      return
    }

    const user = JSON.parse(stored)
    if(user.type === 'admin'){
      this.router.navigate(['/admin'])
      return
    }
    else if(user.type !== 'stamparija'){
      this.router.navigate(['/client'])
      return
    }

    this.currentUser = user;
    this.previewUrl = user.profileImage
      ? 'http://localhost:4000/uploads/profileImages/' + user.profileImage
      : null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(file);
  }

  updateProfile() {
    const formData = new FormData();
    formData.append('username', this.currentUser.username);
    formData.append('firstname', this.currentUser.firstname);
    formData.append('lastname', this.currentUser.lastname);
    formData.append('phone', this.currentUser.phone);
    formData.append('email', this.currentUser.email);
    formData.append('nazivFirme', this.currentUser.nazivFirme);
    formData.append('adresa', this.currentUser.adresa);
    formData.append('grad', this.currentUser.grad);
    formData.append('pib', this.currentUser.pib);
    formData.append('maticniBroj', this.currentUser.maticniBroj);

    if (this.newPassword) formData.append('password', this.newPassword);

    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.userService.updateProfile(formData).subscribe(msg => {
      if (msg.profileImage) {
        (this.currentUser as any).profileImage = msg.profileImage;

        if (this.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = 'http://localhost:4000/uploads/profileImages/' + msg.profileImage;
      }

      localStorage.setItem('loggedUser', JSON.stringify(this.currentUser));

      this.newPassword = '';
      this.selectedFile = null;
    });
  }

  logout(){
    localStorage.removeItem("loggedUser")
    this.router.navigate([''])
  }
}
