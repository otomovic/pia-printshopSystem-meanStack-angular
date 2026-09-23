import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserType } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  user: UserType = new UserType()
  passwordPattern = '^(?=.{8,12}$)(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])[A-Za-z][\\x20-\\x7E]*$'
  phonePattern = '^\\d{10}$'
  emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  pibPattern = '^[1-9]\\d{8}$'
  maticniBrojPattern = '^\\d{8}$'
  userService = inject(UserService)
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  messageBad = "";
  messageGood = "";
  imageError = "";
  sent = false;
  imageGood = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFormEdited() {
    this.messageBad = "";
    this.messageGood = "";
  }

  register() {

    this.messageBad = "";
    this.messageGood = "";
    this.sent = false;

    if(!this.user.username || !this.user.password || !this.user.firstname || !this.user.lastname || !this.user.phone || !this.user.email || !this.user.type){
      this.messageBad = 'Molimo Vas da popunite sva obavezna polja!';
      return;
    }

    if (!new RegExp(this.passwordPattern).test(this.user.password)) {
        this.messageBad = 'Lozinka mora imati 8-12 karaktera, početi slovom i sadržati veliko slovo, broj i specijalni karakter.';
        return;
    }

    if (!new RegExp(this.phonePattern).test(this.user.phone)) {
        this.messageBad = 'Broj telefona mora imati tačno 10 cifara.';
        return;
    }

    if (!new RegExp(this.emailPattern).test(this.user.email)) {
        this.messageBad = 'Email adresa nije ispravnog formata.';
        return;
    }

    if ((this.user.type === 'pravnoLice' || this.user.type === 'stamparija') && (!this.user.nazivFirme || !this.user.adresa || !this.user.pib || !this.user.maticniBroj)) {
        this.messageBad = 'Molimo Vas da popunite sva obavezna polja za pravno lice ili štampariju.';
        return;
    }

    if (this.user.type === 'pravnoLice' || this.user.type === 'stamparija') {
        if (!new RegExp(this.pibPattern).test(this.user.pib)) {
            this.messageBad = 'PIB mora imati tačno 9 cifara i ne sme počinjati nulom.';
            return;
        }

        if (!new RegExp(this.maticniBrojPattern).test(this.user.maticniBroj)) {
            this.messageBad = 'Matični broj mora imati tačno 8 cifara.';
            return;
        }
    }

    if (!this.imageGood) {
      this.messageBad = this.imageError || 'Slika nije validna! Uklonite je ili izaberite drugu.';
      return;
    }

    const formData = new FormData();

    formData.append('username', this.user.username);
    formData.append('password', this.user.password);
    formData.append('firstname', this.user.firstname);
    formData.append('lastname', this.user.lastname);
    formData.append('phone', this.user.phone);
    formData.append('email', this.user.email);
    formData.append('type', this.user.type);

    if (this.user.type === 'pravnoLice' || this.user.type === 'stamparija') {
        formData.append('nazivFirme', this.user.nazivFirme);
        formData.append('adresa', this.user.adresa);
        formData.append('grad', this.user.grad);
        formData.append('pib', this.user.pib);
        formData.append('maticniBroj', this.user.maticniBroj);
    }

    if (this.selectedFile)
        formData.append('profileImage', this.selectedFile);

    this.userService.register(formData).subscribe({
        next: msg => {
            if (msg.message === 'ok') {
                this.messageGood = 'Registracija je uspešno izvršena. Sačekajte odobrenje administratora.';
            } else {
                this.messageBad = msg.message;
            }
        },
        error: error => {
            console.error('Registration failed', error);
            this.messageBad = 'Registracija nije uspela. Pokušajte ponovo.';
        }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    this.clearSelection();

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      this.imageGood = false;
      this.imageError = 'Slika mora biti JPG, PNG ili GIF.';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.width > 250 || img.height < 100 || img.height > 250) {
        this.imageGood = false;
        this.imageError = 'Slika mora biti između 100x100 i 250x250 piksela.';
        URL.revokeObjectURL(objectUrl);
        return;
      }
      this.imageGood = true;
      this.imageError = '';
      this.selectedFile = file;
      this.previewUrl = objectUrl;
    };
    img.onerror = () => {
      this.imageGood = false;
      this.imageError = 'Slika nije validna.';
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }

  removeImage() {
    this.clearSelection();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private clearSelection() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.selectedFile = null;
    this.previewUrl = null;
    this.imageGood = true;
    this.imageError = '';
  }
}
