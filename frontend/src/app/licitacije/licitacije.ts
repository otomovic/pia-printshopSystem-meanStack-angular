import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JavnaNabavkaService } from '../services/javna-nabavka.service';
import { ProductService } from '../services/product.service';

interface StavkaPonude {
  naziv: string;
  kolicina: number;
  productId: string;
  jedinicnaCena: number | null;
}

@Component({
  selector: 'app-licitacije',
  imports: [FormsModule, RouterLink],
  templateUrl: './licitacije.html',
  styleUrl: './licitacije.css',
})
export class Licitacije implements OnInit {
  private javnaNabavkaService = inject(JavnaNabavkaService);
  private productService = inject(ProductService);
  private router = inject(Router);

  stamparijaId = '';
  mojiProizvodi: any[] = [];

  otvorene: any[] = [];
  forme: { [nabavkaId: string]: StavkaPonude[] } = {};

  mojePonude: any[] = [];

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

    this.productService.getMine(this.stamparijaId).subscribe(proizvodi => {
      this.mojiProizvodi = proizvodi;
    });

    this.loadOtvorene();
    this.loadMojePonude();
  }

  loadOtvorene() {
    this.javnaNabavkaService.otvorene(this.stamparijaId).subscribe(nabavke => {
      this.otvorene = nabavke;

      for (const n of nabavke) {
        if (!this.forme[n._id]) {
          this.forme[n._id] = n.stavke.map((s: any) => ({
            naziv: s.naziv,
            kolicina: s.kolicina,
            productId: '',
            jedinicnaCena: null
          }));
        }
      }
    });
  }

  loadMojePonude() {
    this.javnaNabavkaService.mojePonude(this.stamparijaId).subscribe(nabavke => {
      this.mojePonude = nabavke;
    });
  }

  posalji(nabavka: any) {
    const stavke = this.forme[nabavka._id];

    if (stavke.some(s => !s.productId || !s.jedinicnaCena)) {
      this.message = 'Za svaku stavku izaberite proizvod i unesite cenu.';
      return;
    }

    this.javnaNabavkaService.posaljiPonudu(this.stamparijaId, nabavka._id, stavke).subscribe({
      next: () => {
        this.message = '';
        this.loadOtvorene();
        this.loadMojePonude();
      },
      error: (err) => {
        this.message = err.error?.message || 'Greška prilikom slanja ponude.';
      }
    });
  }

  pdfUrl(nabavka: any): string {
    return 'http://localhost:4000/uploads/' + nabavka.pdfPath;
  }
}
