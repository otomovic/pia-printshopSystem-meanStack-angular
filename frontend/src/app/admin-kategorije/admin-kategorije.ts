import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { CategoryType } from '../models/category';

@Component({
  selector: 'app-admin-kategorije',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-kategorije.html',
  styleUrl: './admin-kategorije.css',
})
export class AdminKategorije {
  categoryService = inject(CategoryService);

  kategorije: CategoryType[] = [];
  novaKategorija = '';
  novePotkategorije: { [id: string]: string } = {};
  message = '';

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.categoryService.getAll().subscribe(kategorije => {
      this.kategorije = kategorije;
    });
  }

  dodajKategoriju() {
    if (!this.novaKategorija.trim()) {
      return;
    }

    this.categoryService.dodajKategoriju(this.novaKategorija.trim()).subscribe(res => {
      this.message = res.message === 'ok' ? 'Kategorija je dodata.' : res.message;
      if (res.message === 'ok') {
        this.novaKategorija = '';
        this.ucitaj();
      }
    });
  }

  dodajPotkategoriju(kategorija: CategoryType) {
    let naziv = (this.novePotkategorije[kategorija._id] || '').trim();

    if (!naziv) {
      return;
    }

    this.categoryService.dodajPotkategoriju(kategorija._id, naziv).subscribe(res => {
      this.message = res.message === 'ok' ? 'Potkategorija je dodata.' : res.message;
      if (res.message === 'ok') {
        this.novePotkategorije[kategorija._id] = '';
        this.ucitaj();
      }
    });
  }
}
