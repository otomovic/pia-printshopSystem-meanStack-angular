import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductType } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private base = 'http://localhost:4000/products';

  getTop5() {
    return this.http.get<ProductType[]>(`${this.base}/top5`);
  }

  getCategories() {
    return this.http.get<string[]>(`${this.base}/categories`);
  }

  search(naziv: string, kategorija: string) {
    return this.http.get<ProductType[]>(`${this.base}/search`, { params: { naziv, kategorija } });
  }

  getById(id: string) {
    return this.http.get<ProductType>(`${this.base}/${id}`);
  }

  addProduct(formData: FormData) {
    return this.http.post<{ message: string, _id?: string }>(this.base, formData);
  }

  getMine(stamparijaId: string) {
    return this.http.get<any[]>(`${this.base}/mine`, { params: { stamparijaId } });
  }

  updateKolicina(stamparijaId: string, productId: string, kolicinaNaLageru: number) {
    return this.http.post<{ message: string }>(`${this.base}/kolicina`, { stamparijaId, productId, kolicinaNaLageru });
  }

  reaguj(productId: string, username: string, reakcija: string | null, tekst: string) {
    return this.http.post<{ message: string }>(`${this.base}/${productId}/reaguj`, { username, reakcija, tekst });
  }

  getKomentari(productId: string) {
    return this.http.get<any[]>(`${this.base}/${productId}/komentari`);
  }
}
