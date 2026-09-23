import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FakturaService } from '../services/faktura.service';

@Component({
  selector: 'app-narudzbine',
  imports: [RouterLink],
  templateUrl: './narudzbine.html',
  styleUrl: './narudzbine.css',
})
export class Narudzbine implements OnInit {
  private fakturaService = inject(FakturaService);
  private router = inject(Router);

  stamparijaId = '';
  fakture: any[] = [];

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
    this.load();
  }

  load() {
    this.fakturaService.zaStamparija(this.stamparijaId).subscribe(fakture => {
      this.fakture = fakture;
    });
  }

  naredniKorak(status: string): string | null {
    if (status === 'naruceno') return 'Prebaci u štampu';
    if (status === 'u stampi') return 'Označi kao isporučeno';
    return null;
  }

  napreduj(faktura: any) {
    this.fakturaService.napreduj(this.stamparijaId, faktura._id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Greška prilikom ažuriranja statusa.')
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
