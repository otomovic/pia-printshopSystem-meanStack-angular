import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductType } from '../models/product';

@Component({
  selector: 'app-priprema',
  imports: [FormsModule],
  templateUrl: './priprema.html',
  styleUrl: './priprema.css',
})
export class Priprema implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  product: ProductType | null = null;
  productId = '';
  selectedColor = '';
  selectedUslugaId = '';

  tekst = '';
  overlayImage: File | null = null;
  kolicina = 1;
  message = '';

  private baseImage: HTMLImageElement | null = null;

  get selectedUsluga() {
    return this.product?.uslugeStampe?.find(u => u.idUsluge === this.selectedUslugaId);
  }

  get jedinicnaCena(): number {
    if (!this.product) return 0;
    return this.product.jedinicnaCena + (this.selectedUsluga?.dodatnaCenaPoKomadu || 0);
  }

  get ukupnaCena(): number {
    return this.jedinicnaCena * (this.kolicina || 0);
  }

  ngOnInit() {
    const productId = localStorage.getItem('selectedProductId');
    if (!productId) {
      this.router.navigate(['/']);
      return;
    }
    this.productId = productId;
    this.selectedColor = localStorage.getItem('selectedColor') || 'Bela';
    this.selectedUslugaId = localStorage.getItem('selectedUslugaId') || '';

    this.productService.getById(productId).subscribe(async product => {
      this.product = product;
      if (product.slikaUrl) {
        this.baseImage = await this.loadImage('http://localhost:4000/uploads/products/' + product.slikaUrl);
        this.redraw();
      }
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  onTekstChange() {
    if (this.tekst) {
      this.overlayImage = null;
      if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
    }
    this.redraw();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      this.message = 'Slika mora biti JPG, PNG ili GIF.';
      return;
    }

    this.message = '';
    this.tekst = '';
    this.overlayImage = file;
    this.redraw();
  }

  private async redraw() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.baseImage) return;

    canvas.width = this.baseImage.width;
    canvas.height = this.baseImage.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.baseImage, 0, 0, canvas.width, canvas.height);

    if (this.overlayImage) {
      const overlay = await this.loadImage(URL.createObjectURL(this.overlayImage));
      const maxW = canvas.width * 0.4;
      const maxH = canvas.height * 0.4;
      const scale = Math.min(maxW / overlay.width, maxH / overlay.height, 1);
      const w = overlay.width * scale;
      const h = overlay.height * scale;
      ctx.drawImage(overlay, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    } else if (this.tekst) {
      const fontSize = Math.round(canvas.width * 0.06);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(this.tekst).width;
      const padding = 16;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(
        canvas.width / 2 - textWidth / 2 - padding,
        canvas.height / 2 - fontSize / 2 - padding / 2,
        textWidth + padding * 2,
        fontSize + padding
      );

      ctx.fillStyle = '#000';
      ctx.fillText(this.tekst, canvas.width / 2, canvas.height / 2);
    }
  }

  ponisti() {
    this.tekst = '';
    this.overlayImage = null;
    this.kolicina = 1;
    this.message = '';
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
    this.redraw();
  }

  nazad() {
    this.router.navigate(['/proizvod']);
  }

  dodajUKorpu() {
    if (!this.product) return;

    if (!this.kolicina || this.kolicina < 1) {
      this.message = 'Unesite ispravnu količinu.';
      return;
    }

    if (this.product.kolicinaNaLageru !== undefined && this.kolicina > this.product.kolicinaNaLageru) {
      this.message = 'Nema dovoljno proizvoda trenutno na stanju';
      return;
    }

    const canvas = this.canvasRef?.nativeElement;
    const renderedImage = canvas ? canvas.toDataURL('image/jpeg', 0.8) : 'http://localhost:4000/uploads/products/' + this.product.slikaUrl;

    const usluga = this.selectedUsluga;
    const jedinicnaCena = this.jedinicnaCena;

    const cartItem = {
      productId: this.productId,
      stamparijaId: this.product.stamparijaId,
      printerName: this.product.printerName,
      grad: this.product.grad,
      naziv: this.product.naziv,
      jedinicnaCena: jedinicnaCena,
      ukupnaCena: jedinicnaCena * this.kolicina,
      boja: this.selectedColor,
      uslugaId: this.selectedUslugaId,
      tipStampe: usluga ? usluga.tipStampe : '',
      tekst: this.tekst,
      kolicina: this.kolicina,
      slika: renderedImage
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    this.router.navigate(['/korpa']);
  }
}
