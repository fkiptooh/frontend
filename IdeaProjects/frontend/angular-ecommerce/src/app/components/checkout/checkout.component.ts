import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { County } from 'src/app/common/county';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Town } from 'src/app/common/town';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { EcommerceFormService } from 'src/app/services/ecommerce-form.service';
import { EcommerceValidators } from 'src/app/validators/ecommerce-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number =0;
  totalQuantity: number = 0;
  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  counties: County[] = [];  

  shippingAddressTowns: Town[] = [];
  billingAddressTowns: Town[] = [];


  constructor(private formBuilder: FormBuilder, 
              private ecommerceFormService: EcommerceFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    this.reviewCartDetails();
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        email: new FormControl('',
                              [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        county: new FormControl('', [Validators.required]),
        postalCode: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        town: new FormControl('', [Validators.required])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        county: new FormControl('', [Validators.required]),
        postalCode: new FormControl('', [Validators.required, Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        town: new FormControl('', [Validators.required])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, 
                                        Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() +1;
    console.log("start month: " + startMonth);

    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
        data=>{
          console.log("Retreiving  credit card months: " + JSON.stringify(data));
          this.creditCardMonths = data
        });

    // populate credit card years
    this.ecommerceFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retreiving  credit card years: " + JSON.stringify(data));
        this.creditCardYears = data
      });

      // populate counties
      this.ecommerceFormService.getCounties().subscribe(
        data => {
          console.log("Retieving counties " + JSON.stringify(data));
          this.counties = data;
        }
      );
  }
  reviewCartDetails() {
    // subscribe to cartService.totalQuantity and cartService.totalPrice
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  get firstName(){ return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName');}
  get email(){ return this.checkoutFormGroup.get('customer.email');} 

  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street');} 
  get shippingAddressCounty(){ return this.checkoutFormGroup.get('shippingAddress.county');} 
  get shippingAddressPostalCode(){ return this.checkoutFormGroup.get('shippingAddress.postalCode');} 
  get shippingAddressTown(){ return this.checkoutFormGroup.get('shippingAddress.town');} 

  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street');} 
  get billingAddressCounty(){ return this.checkoutFormGroup.get('billingAddress.county');} 
  get billingAddressPostalCode(){ return this.checkoutFormGroup.get('billingAddress.postalCode');} 
  get billingAddressTown(){ return this.checkoutFormGroup.get('billingAddress.town');} 

  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode');}

  copyShippingAddressToBillingAddress(event: { target: { checked: any; }; }){
    
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bux fixing for towns

      this.billingAddressTowns = this.shippingAddressTowns;

    } 
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // bux fixing for towns

      this.billingAddressTowns = [];
    }
    
  }

  onSubmit(){
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    // console.log(this.checkoutFormGroup.get('customer').value);
    // console.log("The email address is " + this.checkoutFormGroup.get('customer').value.email);

    // console.log("The shipping address county " + this.checkoutFormGroup.get('shippingAddress').value.county.name);
    // console.log("The shipping address state " + this.checkoutFormGroup.get('shippingAddress').value.town.name);

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // long way
    // let orderItems: OrderItem[] = [];
    // for(let i=0; i < orderItems.length; i++){
    //   orderItems[i] = new OrderItem(cartItems[i]);
    // }

    // short way
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase --custommer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase -shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingTown: Town = JSON.parse(JSON.stringify(purchase.shippingAddress.town));
    const shippingCounty: County = JSON.parse(JSON.stringify(purchase.shippingAddress.county));
    purchase.shippingAddress.town = shippingTown.name;
    purchase.shippingAddress.county = shippingCounty.name;

    // populate puchase -billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingTown: Town = JSON.parse(JSON.stringify(purchase.billingAddress.town));
    const billingCounty: County = JSON.parse(JSON.stringify(purchase.billingAddress.county));
    purchase.billingAddress.town = billingTown.name;
    purchase.billingAddress.county = billingCounty.name;

    // populate purchase -order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response =>{
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
        // reset the cart
        this.resetCart();

        },
        error: errMsg=>{
          alert(`There was an error: ${errMsg.message}`);
        }
      }
    );
  }
  resetCart() {
    // reset the cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }
  handleYearAndMonths(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // if the current year is equals to the selected year the we start with

    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }
    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retreiving credit card months " +JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }
  getTowns(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countyCode = formGroup.value.county.code;
    const countyName = formGroup.value.county.name;

    console.log(`${formGroupName} county code: ${countyCode}`);
    console.log(`${formGroupName} county code: ${countyName}`);

    this.ecommerceFormService.getTowns(countyCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressTowns = data;
        }
        else{
          this.billingAddressTowns = data;
        }
        // sellecting first item by default
        formGroup.get('town').setValue(data[0]);
      }
    );

  }

}


