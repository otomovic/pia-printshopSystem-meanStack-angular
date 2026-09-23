import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CategoryType, SubcategoryType } from '../models/category';
import { UslugaStampeType } from '../models/product';

@Component({
  selector: 'app-dodaj-proizvod',
  imports: [FormsModule, RouterLink],
  templateUrl: './dodaj-proizvod.html',
  styleUrl: './dodaj-proizvod.css',
})
export class DodajProizvod implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  stamparijaId = '';
  categories: CategoryType[] = [];
  subcategories: SubcategoryType[] = [];

  sifra = '';
  naziv = '';
  opis = '';
  kategorija = '';
  potkategorija = '';
  jedinicnaCena: number | null = null;
  kolicinaNaLageru: number | null = null;
  dostupneBoje = '';

  uslugeStampe: UslugaStampeType[] = [];

  mainImage: File | null = null;
  additionalImages: File[] = [];

  message = '';

  ngOnInit() {
    const stored = localStorage.getItem('loggedUser');
    if (!stored) {
      this.router.navigate(['login']);
      return;
    }

    const user = JSON.parse(stored);
    if (user.type !== 'stamparija') {
      this.router.navigate(['login']);
      return;
    }

    this.stamparijaId = user.stamparijaId;

    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories;
    });
  }

  onCategoryChange() {
    const found = this.categories.find(c => c.naziv === this.kategorija);
    this.subcategories = found ? found.potkategorije : [];
    this.potkategorija = '';
  }

  onMainImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.mainImage = file;
  }

  onAdditionalImagesSelected(event: any) {
    this.additionalImages = Array.from(event.target.files as FileList).slice(0, 3);
  }

  addUsluga() {
    this.uslugeStampe.push({
      idUsluge: '',
      tipStampe: '',
      dodatnaCenaPoKomadu: 0,
      maxSirinaMm: 0,
      maxVisinaMm: 0
    });
  }

  removeUsluga(index: number) {
    this.uslugeStampe.splice(index, 1);
  }

  submit() {
    if (!this.sifra || !this.naziv || !this.jedinicnaCena) {
      this.message = 'Molimo popunite šifru, naziv i jediničnu cenu proizvoda.';
      return;
    }

    const formData = new FormData();
    formData.append('stamparijaId', this.stamparijaId);
    formData.append('sifra', this.sifra);
    formData.append('naziv', this.naziv);
    formData.append('opis', this.opis);
    formData.append('kategorija', this.kategorija);
    formData.append('potkategorija', this.potkategorija);
    formData.append('jedinicnaCena', String(this.jedinicnaCena));
    formData.append('kolicinaNaLageru', String(this.kolicinaNaLageru || 0));

    if (this.dostupneBoje) formData.append('dostupneBoje', this.dostupneBoje);

    formData.append('uslugeStampe', JSON.stringify(this.uslugeStampe));

    if (this.mainImage) formData.append('slikaGlavna', this.mainImage);
    this.additionalImages.forEach(file => formData.append('dodatneSlike', file));

    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.router.navigate(['/stampar']);
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Greška prilikom čuvanja proizvoda.';
      }
    });
  }
}
