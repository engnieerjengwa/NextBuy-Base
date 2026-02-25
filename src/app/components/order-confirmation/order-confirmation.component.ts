import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
})
export class OrderConfirmationComponent implements OnInit {
  orderTrackingNumber: string = '';
  totalPrice: number = 0;
  totalQuantity: number = 0;
  customerEmail: string = '';
  estimatedDelivery: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.orderTrackingNumber = params.get('tracking') || '';
      this.totalPrice = +(params.get('total') || '0');
      this.totalQuantity = +(params.get('qty') || '0');
      this.customerEmail = params.get('email') || '';
    });

    // Estimated delivery: 5-7 business days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    this.estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
