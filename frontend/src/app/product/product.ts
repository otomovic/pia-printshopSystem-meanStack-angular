import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductService } from '../services/product.service';
import { ProductType } from '../models/product';

const IMAGE_BASE = 'http://localhost:4000/uploads/products/';

@Component({
  selector: 'app-product',
  imports: [RouterLink, FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  product: ProductType | null = null;
  isClient = false;
  currentUsername = '';

  selectedColor = 'Bela';
  selectedUslugaId = '';

  galleryImages: string[] = [];
  mainImage = '';
  mapUrl: SafeResourceUrl | null = null;

  komentari: any[] = [];

  private productId = '';

  ngOnInit() {
    const productId = localStorage.getItem('selectedProductId');
    if (!productId) {
      this.router.navigate(['/']);
      return;
    }
    this.productId = productId;

    const stored = localStorage.getItem('loggedUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.isClient = user.type === 'fizickoLice' || user.type === 'pravnoLice';
      this.currentUsername = user.username;
    }

    this.productService.getById(productId).subscribe(product => {
      this.product = product;
      this.selectedColor = product.dostupneBoje?.[0] || 'Bela';

      this.galleryImages = [product.slikaUrl, ...(product.slikeDodatne || [])]
        .filter((img): img is string => !!img)
        .slice(0, 4)
        .map(img => IMAGE_BASE + img);

      const savedImage = this.getCookie(`mainImage_${productId}`);
      this.mainImage = savedImage && this.galleryImages.includes(savedImage)
        ? savedImage
        : (this.galleryImages[0] || '');

      const upit = [product.grad, product.printerName].filter(v => !!v).join(' ');
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${encodeURIComponent(upit)}&output=embed`
      );
    });

    this.productService.getKomentari(productId).subscribe(komentari => {
      this.komentari = komentari;
    });
  }

  selectImage(image: string) {
    this.mainImage = image;
    this.setCookie(`mainImage_${this.productId}`, image, 365);
  }

  get selectedUsluga() {
    return this.product?.uslugeStampe?.find(u => u.idUsluge === this.selectedUslugaId);
  }

  get displayPrice(): number {
    if (!this.product) return 0;
    return this.product.jedinicnaCena + (this.selectedUsluga?.dodatnaCenaPoKomadu || 0);
  }

  goToPriprema() {
    localStorage.setItem('selectedColor', this.selectedColor);
    localStorage.setItem('selectedUslugaId', this.selectedUslugaId);
    this.router.navigate(['/priprema']);
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  private setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
  }
}
