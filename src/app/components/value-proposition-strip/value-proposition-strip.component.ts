import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-value-proposition-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './value-proposition-strip.component.html',
  styleUrl: './value-proposition-strip.component.css',
})
export class ValuePropositionStripComponent {
  propositions = [
    {
      icon: '&#128666;',
      title: 'Free Delivery',
      subtitle: 'On orders over $50',
    },
    {
      icon: '&#128274;',
      title: 'Secure Payments',
      subtitle: 'SSL encrypted checkout',
    },
    {
      icon: '&#128257;',
      title: 'Easy Returns',
      subtitle: '30-day return policy',
    },
    {
      icon: '&#128222;',
      title: '24/7 Support',
      subtitle: 'Dedicated help center',
    },
  ];
}
