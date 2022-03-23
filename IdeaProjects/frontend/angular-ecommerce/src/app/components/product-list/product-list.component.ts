import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number =1;
  searchMode: boolean = false;
  previousCategoryId: number = 1;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = null;

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    });
  }

  listProducts(){

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();

    } 
    else{
        this.handleListProducts();
    }
  }

  handleSearchProducts(){
    const theKeyword: any = this.route.snapshot.paramMap.get('keyword');

    // if we have a different keyword than a previous one
    // then set  thePageNumber to 1
    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    // search for products using the given keyword
    this.productService.searchProductsPaginate(this.thePageNumber -1,
                                               this.thePageSize,
                                                theKeyword).subscribe(this.processResults());
  }

  handleListProducts(){
        // check to see if "id" param is available
        const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')

        if (hasCategoryId){
          // get the "id" param string and convert it into a number using (+) symbol
          this.currentCategoryId = +this.route.snapshot.paramMap.get('id');
        }
        else{
          // if category id is not provided lets default to 1
          this.currentCategoryId = 1;
        }

        // 
        // checking if we have different category than previous
        // Note: angular will reuse the component if it is currently being viewed
        // 

        // if we are having a different category id than previous
        // then set thePage number back to 1
        if(this.previousCategoryId != this.currentCategoryId){
          this.thePageNumber = 1;
        }

        this.previousCategoryId = this.currentCategoryId;

        console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
      
        // Now get products for the given category id
          this.productService.getProductListPaginate(this.thePageNumber -1,
                                                      this.thePageSize,
                                                      this.currentCategoryId)
                                                      .subscribe(this.processResults());

  }
  processResults(){
    return (data: { _embedded: { products: Product[]; }; page: { number: number; size: number; totalElements: number; }; }) =>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };   
  }
  updatePageSize(pageSize: number){
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();

  }

  addToCart(theProduct: Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    // TODO ... do the real work  
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
    

}
