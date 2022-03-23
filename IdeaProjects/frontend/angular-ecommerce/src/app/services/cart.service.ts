import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem) {
    // check if we have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      // find the item in the cart based on the item id

      // for(let tempCartItem of this.cartItems){
      //   if(tempCartItem.id===theCartItem.id){
      //     existingCartItem=tempCartItem;
      //     break;
      //   }
      // }
      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id);

      // check if we found it
      alreadyExistsInCart = (existingCartItem!=undefined);
    }

    if(alreadyExistsInCart){
      // increment the quantity of the item
      existingCartItem.quantity++;
    }
    else{
      // just item to the array
      this.cartItems.push(theCartItem);
    }
    // compute the cart total price and total quantity
    this.computeCartTotals();

  }

  computeCartTotals() {

    let totalPriceValue: number =0;
    let totalQuantiyValue: number = 0;

    for (let currentCartItems of this.cartItems){
      totalPriceValue += currentCartItems.quantity * currentCartItems.unitPrice;
      totalQuantiyValue += currentCartItems.quantity; 
    }
    //  publish new values ...all subscibers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantiyValue);

    // log cart data items for debugging purposes
    this.logCartData(totalPriceValue, totalQuantiyValue);
  }

  logCartData(totalPriceValue: number, totalQuantiyValue: number) {
    console.log('contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, 
                  unitPrice= ${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuanity: ${totalQuantiyValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if(theCartItem.quantity == 0){
      this.remove(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of the item in the array

    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id);

    // if found remove the item from the array of given index
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals(); 
    }

  }
}
