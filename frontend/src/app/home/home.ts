import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  productService = inject(ProductService);
  userService = inject(UserService);
  private router = inject(Router);

  printerCount: number = 0;
  topProducts: any[] = [];
  categories: string[] = [];

  searchTerm = '';
  selectedCategory = '';
  results: any[] = [];
  searched = false;

  sortField = '';
  sortAsc = true;

  ngOnInit() {
    if(localStorage.getItem("loggedUser")){
      const user = JSON.parse(localStorage.getItem("loggedUser")!);
      if(user.type === 'admin'){
        this.router.navigate(['/admin']);
        return;
      }
      else if(user.type === 'stamparija'){
        this.router.navigate(['/stampar']);
        return;
      }
      else if(user.type === 'fizickoLice' || user.type === 'pravnoLice'){
        this.router.navigate(['/client']);
        return;
      }
    }
    this.userService.getPrintingCompanyNumber().subscribe(count => {
      this.printerCount = count;
    });
    this.productService.getTop5().subscribe(products => {
      this.topProducts = products;
    });
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  search() {
    this.productService.search(this.searchTerm, this.selectedCategory).subscribe(products => {
      this.results = products;
      this.searched = true;
    });
  }

  sortBy(field: string) {
    if (field === this.sortField) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.results.sort((a, b) => a[field].localeCompare(b[field]) * (this.sortAsc ? 1 : -1));
  }

  goToDetails(productId: string) {
    localStorage.setItem('selectedProductId', productId);
    this.router.navigate(['/proizvod']);
  }
}
