import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import { FakturaService } from '../services/faktura.service';
import { UserType } from '../models/user';

@Component({
  selector: 'app-client',
  imports: [FormsModule, RouterLink],
  templateUrl: './client.html',
  styleUrl: './client.css',
})
export class Client implements OnInit {
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private fakturaService = inject(FakturaService);
  private router = inject(Router);

  fakture: any[] = [];
  fakturaSortField = '';
  fakturaSortAsc = true;

  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];
  results: any[] = [];
  searched = false;

  sortField = '';
  sortAsc = true;

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
    else if(user.type === 'stamparija'){
      this.router.navigate(['/stampar'])
      return
    }

    this.currentUser = user;
    this.previewUrl = user.profileImage
      ? 'http://localhost:4000/uploads/profileImages/' + user.profileImage
      : null;

    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.loadFakture();
  }

  loadFakture() {
    this.fakturaService.getMine(this.currentUser.username).subscribe(fakture => {
      this.fakture = fakture;
    });
  }

  sortFakture(field: string) {
    if (field === this.fakturaSortField) {
      this.fakturaSortAsc = !this.fakturaSortAsc;
    } else {
      this.fakturaSortField = field;
      this.fakturaSortAsc = true;
    }
    this.fakture.sort((a, b) => {
      const av = a[field] ?? '';
      const bv = b[field] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return cmp * (this.fakturaSortAsc ? 1 : -1);
    });
  }

  otkaziFakturu(fakturaId: string) {
    this.fakturaService.otkazi(this.currentUser.username, fakturaId).subscribe({
      next: () => this.loadFakture(),
      error: (err) => alert(err.error?.message || 'Greška prilikom otkazivanja narudžbine.')
    });
  }

  search() {
    this.productService.search(this.searchTerm, this.selectedCategory).subscribe(products => {
      this.results = products;
      this.searched = true;
    });
  }

  sortBy(field: string) {
    if (field === this.sortField) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.results.sort((a, b) => a[field].localeCompare(b[field]) * (this.sortAsc ? 1 : -1));
  }

  goToDetails(productId: string) {
    localStorage.setItem('selectedProductId', productId);
    this.router.navigate(['/proizvod']);
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

    if (this.newPassword) formData.append('password', this.newPassword);

    if (this.currentUser.type === 'pravnoLice' || this.currentUser.type === 'stamparija') {
      formData.append('nazivFirme', this.currentUser.nazivFirme);
      formData.append('adresa', this.currentUser.adresa);
      formData.append('grad', this.currentUser.grad);
      formData.append('pib', this.currentUser.pib);
      formData.append('maticniBroj', this.currentUser.maticniBroj);
    }

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

  statusFakture(status: string): string {
    if (status === 'naruceno') return 'Naručeno';
    if (status === 'u stampi') return 'U štampi';
    if (status === 'isporuceno') return 'Isporučeno';
    if (status === 'primljeno') return 'Primljeno';
    if (status === 'otkazano') return 'Otkazano';
    return status;
  }
}
