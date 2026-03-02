import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCategory } from '../../common/product-category';

@Component({
  selector: 'app-department-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './department-grid.component.html',
  styleUrls: ['./department-grid.component.css'],
})
export class DepartmentGridComponent implements OnInit {
  departments: ProductCategory[] = [];
  loading = true;
  activeDepartment: ProductCategory | null = null;
  private hoverTimeout: any = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.productService.getProductCategories().subscribe({
      next: (categories) => {
        this.departments = categories.filter((c) => c.isActive !== false);
        this.loading = false;
      },
      error: () => {
        this.departments = [];
        this.loading = false;
      },
    });
  }

  onDeptHover(dept: ProductCategory): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.activeDepartment = dept;
  }

  onDeptLeave(): void {
    this.hoverTimeout = setTimeout(() => {
      this.activeDepartment = null;
    }, 200);
  }
}
