import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NajnarucivanijiProizvodType, OcenaProizvodaType, PrometStamparijeType } from '../models/statistika';

@Injectable({
  providedIn: 'root',
})
export class StatistikaService {
  private http = inject(HttpClient);

  promet() {
    return this.http.get<PrometStamparijeType[]>('http://localhost:4000/statistika/promet');
  }

  najnarucivaniji() {
    return this.http.get<NajnarucivanijiProizvodType[]>('http://localhost:4000/statistika/najnarucivaniji');
  }

  ocene() {
    return this.http.get<OcenaProizvodaType[]>('http://localhost:4000/statistika/ocene');
  }
}
