import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-azuriranje-kolicina',
  imports: [FormsModule, RouterLink],
  templateUrl: './azuriranje-kolicina.html',
  styleUrl: './azuriranje-kolicina.css',
})
export class AzuriranjeKolicina implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  stamparijaId = '';
  proizvodi: any[] = [];
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

    this.stamparijaId = user.pib;
    this.load();
  }

  load() {
    this.productService.getMine(this.stamparijaId).subscribe({
      next: proizvodi => {
        this.proizvodi = proizvodi;
        this.message = '';
      },
      error: err => {
        this.message = err.error?.message || `Greška prilikom učitavanja proizvoda (status ${err.status}).`;
      }
    });
  }

  sacuvaj(proizvod: any) {
    this.productService.updateKolicina(this.stamparijaId, proizvod._id, proizvod.kolicinaNaLageru).subscribe({
      next: () => {
        this.message = '';
      },
      error: (err) => {
        this.message = err.error?.message || 'Greška prilikom čuvanja količine.';
      }
    });
  }
}
