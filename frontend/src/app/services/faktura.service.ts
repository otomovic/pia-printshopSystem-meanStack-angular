import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FakturaService {
  private http = inject(HttpClient);

  confirm(username: string, items: any[]) {
    return this.http.post<{ message: string, brojFaktura?: number }>('http://localhost:4000/fakture/confirm', { username, items });
  }

  getMine(username: string) {
    return this.http.get<any[]>('http://localhost:4000/fakture/mine', { params: { username } });
  }

  otkazi(username: string, fakturaId: string) {
    return this.http.post<{ message: string }>('http://localhost:4000/fakture/otkazi', { username, fakturaId });
  }

  primi(username: string, fakturaId: string) {
    return this.http.post<{ message: string }>('http://localhost:4000/fakture/primi', { username, fakturaId });
  }

  zaStamparija(stamparijaId: string) {
    return this.http.get<any[]>('http://localhost:4000/fakture/zaStamparija', { params: { stamparijaId } });
  }

  napreduj(stamparijaId: string, fakturaId: string) {
    return this.http.post<{ message: string, status?: string }>('http://localhost:4000/fakture/napreduj', { stamparijaId, fakturaId });
  }
}
