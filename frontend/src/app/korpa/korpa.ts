import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FakturaService } from '../services/faktura.service';
import { JavnaNabavkaService } from '../services/javna-nabavka.service';

interface CartItem {
  productId: string;
  stamparijaId: string;
  printerName: string;
  grad: string;
  naziv: string;
  jedinicnaCena: number;
  ukupnaCena: number;
  boja: string;
  uslugaId: string;
  tipStampe: string;
  tekst: string;
  kolicina: number;
  slika: string;
}

interface StamparijaGroup {
  stamparijaId: string;
  printerName: string;
  grad: string;
  items: CartItem[];
  ukupanIznos: number;
}

@Component({
  selector: 'app-korpa',
  imports: [RouterLink],
  templateUrl: './korpa.html',
  styleUrl: './korpa.css',
})
export class Korpa implements OnInit {
  private fakturaService = inject(FakturaService);
  private javnaNabavkaService = inject(JavnaNabavkaService);
  private router = inject(Router);

  groups: StamparijaGroup[] = [];
  message = '';
  isPravnoLice = false;

  ngOnInit() {
    const stored = localStorage.getItem('loggedUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.isPravnoLice = user.type === 'pravnoLice';
    }

    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    const byStamparija: { [id: string]: StamparijaGroup } = {};
    for (const item of cart) {
      const id = item.stamparijaId || 'nepoznato';
      if (!byStamparija[id]) {
        byStamparija[id] = {
          stamparijaId: id,
          printerName: item.printerName,
          grad: item.grad,
          items: [],
          ukupanIznos: 0
        };
      }
      byStamparija[id].items.push(item);
      byStamparija[id].ukupanIznos += item.ukupnaCena;
    }

    this.groups = Object.values(byStamparija);
  }

  potvrdi() {
    const stored = localStorage.getItem('loggedUser');
    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }
    const user = JSON.parse(stored);
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    if (this.isPravnoLice) {
      const items = cart.map(i => ({ naziv: i.naziv, kolicina: i.kolicina }));

      this.javnaNabavkaService.kreiraj(user.username, items).subscribe({
        next: res => {
          if (res.message === 'ok') {
            localStorage.removeItem('cart');
            this.router.navigate(['/javne-nabavke']);
          } else {
            this.message = res.message;
          }
        },
        error: err => {
          this.message = err.error?.message || 'Greška prilikom raspisivanja javne nabavke.';
        }
      });
      return;
    }

    const items = cart.map(i => ({
      productId: i.productId,
      kolicina: i.kolicina,
      boja: i.boja,
      uslugaId: i.uslugaId,
      tekst: i.tekst,
      slika: i.slika
    }));

    this.fakturaService.confirm(user.username, items).subscribe({
      next: res => {
        if (res.message === 'ok') {
          localStorage.removeItem('cart');
          this.router.navigate(['/client']);
        } else {
          this.message = res.message;
        }
      },
      error: err => {
        this.message = err.error?.message || 'Greška prilikom kreiranja narudžbine.';
      }
    });
  }
}
