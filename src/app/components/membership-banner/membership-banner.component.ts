import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-membership-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './membership-banner.component.html',
  styleUrls: ['./membership-banner.component.css'],
})
export class MembershipBannerComponent {}
