import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { OrderHistoryService } from '../../services/order-history.service';
import { ReturnService } from '../../services/return.service';
import { OrderHistory } from '../../common/order-history';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-return',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './log-return.component.html',
  styleUrl: './log-return.component.css'
})
export class LogReturnComponent implements OnInit {

  order: OrderHistory | undefined;
  orderId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  returnForm: FormGroup;
  returnReasons: string[] = ['Damaged', 'Wrong item', 'Not as described', 'Changed mind'];
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private returnService: ReturnService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.returnForm = this.formBuilder.group({
      returnReason: ['', Validators.required],
      comments: [''],
      returnItems: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        this.orderId = id;
        this.loadOrder();
      } else {
        this.errorMessage = 'Order ID not found in URL';
        this.isLoading = false;
      }
    });
  }

  loadOrder() {
    this.isLoading = true;
    this.orderHistoryService.getOrderById(this.orderId).subscribe({
      next: (orderData) => {
        this.order = orderData;

        // Check if order is eligible for return
        if (!this.orderHistoryService.isEligibleForReturn(this.order)) {
          this.errorMessage = 'This order is not eligible for return';
        } else {
          // Initialize form with order items
          this.initializeReturnItems();
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Error fetching order: ${err.message}`;
        this.isLoading = false;
      }
    });
  }

  get returnItemsFormArray(): FormArray {
    return this.returnForm.get('returnItems') as FormArray;
  }

  // Helper method to get form controls as FormGroup for template binding
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  initializeReturnItems() {
    // For now, we'll use placeholder data
    // In a real implementation, we would iterate through order.orderItems
    const itemsArray = this.returnForm.get('returnItems') as FormArray;

    // Add a placeholder item
    itemsArray.push(
      this.formBuilder.group({
        orderItemId: [1],
        productName: ['Sample Product'],
        quantity: [1],
        maxQuantity: [2],
        selected: [false],
        reason: ['']
      })
    );

    // Add another placeholder item
    itemsArray.push(
      this.formBuilder.group({
        orderItemId: [2],
        productName: ['Another Product'],
        quantity: [1],
        maxQuantity: [3],
        selected: [false],
        reason: ['']
      })
    );
  }

  onSubmit() {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }

    // Check if at least one item is selected
    const selectedItems = this.returnItemsFormArray.controls.filter(
      control => (control as FormGroup).get('selected')?.value === true
    );

    if (selectedItems.length === 0) {
      alert('Please select at least one item to return');
      return;
    }

    // Validate that selected items have a reason
    const invalidItems = selectedItems.filter(
      control => !(control as FormGroup).get('reason')?.value
    );

    if (invalidItems.length > 0) {
      alert('Please provide a reason for each selected item');
      return;
    }

    this.isSubmitting = true;

    // Prepare return request data
    const returnRequest = {
      orderId: this.orderId,
      returnReason: this.returnForm.get('returnReason')?.value,
      comments: this.returnForm.get('comments')?.value,
      returnItems: selectedItems.map(item => ({
        orderItemId: (item as FormGroup).get('orderItemId')?.value,
        quantity: (item as FormGroup).get('quantity')?.value,
        reason: (item as FormGroup).get('reason')?.value
      }))
    };

    // Submit return request
    this.returnService.createReturnRequest(returnRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = `Error submitting return request: ${err.message}`;
      }
    });
  }

  backToOrderDetail() {
    this.router.navigate(['/orders', this.orderId]);
  }

  backToOrderHistory() {
    this.router.navigate(['/orders']);
  }
}
