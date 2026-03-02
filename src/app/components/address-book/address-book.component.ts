import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavedAddressService } from '../../services/saved-address.service';
import { SavedAddress, SavedAddressRequest } from '../../common/saved-address';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-book.component.html',
  styleUrl: './address-book.component.css',
})
export class AddressBookComponent implements OnInit {
  addresses: SavedAddress[] = [];
  loading: boolean = true;
  showForm: boolean = false;
  editingAddress: SavedAddress | null = null;
  submitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  formData: SavedAddressRequest = {
    label: 'HOME',
    street: '',
    city: '',
    province: '',
    country: '',
    zipCode: '',
    phoneNumber: '',
    isDefault: false,
  };

  labels = ['HOME', 'WORK', 'OTHER'];

  constructor(private addressService: SavedAddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading addresses', err);
        this.loading = false;
      },
    });
  }

  openAddForm(): void {
    this.editingAddress = null;
    this.formData = {
      label: 'HOME',
      street: '',
      city: '',
      province: '',
      country: '',
      zipCode: '',
      phoneNumber: '',
      isDefault: false,
    };
    this.showForm = true;
    this.errorMessage = '';
  }

  openEditForm(address: SavedAddress): void {
    this.editingAddress = address;
    this.formData = {
      label: address.label,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      zipCode: address.zipCode,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    };
    this.showForm = true;
    this.errorMessage = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAddress = null;
    this.errorMessage = '';
  }

  saveAddress(): void {
    if (
      !this.formData.street ||
      !this.formData.city ||
      !this.formData.country ||
      !this.formData.zipCode
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const obs = this.editingAddress
      ? this.addressService.updateAddress(this.editingAddress.id, this.formData)
      : this.addressService.createAddress(this.formData);

    obs.subscribe({
      next: () => {
        this.showForm = false;
        this.editingAddress = null;
        this.submitting = false;
        this.successMessage = this.editingAddress
          ? 'Address updated!'
          : 'Address added!';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.loadAddresses();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save address';
        this.submitting = false;
      },
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.addresses = this.addresses.filter((a) => a.id !== addressId);
          this.successMessage = 'Address deleted';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => console.error('Error deleting address', err),
      });
    }
  }

  setDefault(addressId: number): void {
    this.addressService.setDefault(addressId).subscribe({
      next: () => this.loadAddresses(),
      error: (err) => console.error('Error setting default', err),
    });
  }

  getLabelIcon(label: string): string {
    switch (label) {
      case 'HOME':
        return 'fa-home';
      case 'WORK':
        return 'fa-briefcase';
      default:
        return 'fa-map-marker-alt';
    }
  }
}
