import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CategoryType } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<CategoryType[]>('http://localhost:4000/categories');
  }

  dodajKategoriju(naziv: string) {
    return this.http.post<{ message: string, _id?: string }>('http://localhost:4000/categories', { naziv: naziv });
  }

  dodajPotkategoriju(kategorijaId: string, naziv: string) {
    return this.http.post<{ message: string }>(`http://localhost:4000/categories/${kategorijaId}/potkategorija`, { naziv: naziv });
  }
}
