import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FakturaService } from '../services/faktura.service';
import { ProductService } from '../services/product.service';

interface ArhivaRed {
  fakturaId: string;
  datum: string;
  status: string;
  nazivStamparije: string;
  productId: string;
  naziv: string;
  kolicina: number;
  komentar: string;
}

@Component({
  selector: 'app-arhiva-proizvoda',
  imports: [FormsModule, RouterLink],
  templateUrl: './arhiva-proizvoda.html',
  styleUrl: './arhiva-proizvoda.css',
})
export class ArhivaProizvoda implements OnInit {
  private fakturaService = inject(FakturaService);
  private productService = inject(ProductService);
  private router = inject(Router);

  username = '';
  redovi: ArhivaRed[] = [];

  sortField = 'datum';
  sortAsc = false;

  ngOnInit() {
    const stored = localStorage.getItem('loggedUser');
    if (!stored) {
      this.router.navigate(['login']);
      return;
    }

    const user = JSON.parse(stored);
    if (user.type !== 'fizickoLice' && user.type !== 'pravnoLice') {
      this.router.navigate(['login']);
      return;
    }

    this.username = user.username;
    this.load();
  }

  load() {
    this.fakturaService.getMine(this.username).subscribe(fakture => {
      const redovi: ArhivaRed[] = [];

      for (const f of fakture) {
        if (f.status !== 'isporuceno' && f.status !== 'primljeno') continue;

        for (const s of f.stavke) {
          redovi.push({
            fakturaId: f._id,
            datum: f.datum,
            status: f.status,
            nazivStamparije: f.nazivStamparije,
            productId: s.productId,
            naziv: s.naziv,
            kolicina: s.kolicina,
            komentar: ''
          });
        }
      }

      this.redovi = redovi;
      this.sortBy(this.sortField, true);
    });
  }

  sortBy(field: string, keepDirection = false) {
    if (!keepDirection) {
      if (field === this.sortField) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortField = field;
        this.sortAsc = true;
      }
    }

    this.redovi.sort((a, b) => {
      const av = (a as any)[field];
      const bv = (b as any)[field];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return cmp * (this.sortAsc ? 1 : -1);
    });
  }

  potvrdiPrijem(red: ArhivaRed) {
    this.fakturaService.primi(this.username, red.fakturaId).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Greška prilikom ažuriranja narudžbine.')
    });
  }

  posaljiReakciju(red: ArhivaRed, reakcija: 'lajk' | 'dislajk') {
    this.productService.reaguj(red.productId, this.username, reakcija, red.komentar).subscribe(() => {
      red.komentar = '';
      alert('Ocena ostavljena.');
    });
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
