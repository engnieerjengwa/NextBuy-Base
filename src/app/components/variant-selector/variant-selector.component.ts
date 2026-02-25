import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductVariant } from '../../common/product';

@Component({
  selector: 'app-variant-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variant-selector.component.html',
  styleUrls: ['./variant-selector.component.css'],
})
export class VariantSelectorComponent implements OnChanges {
  @Input() variants: ProductVariant[] = [];
  @Output() variantSelected = new EventEmitter<ProductVariant | null>();

  variantTypes: string[] = [];
  variantsByType: Map<string, ProductVariant[]> = new Map();
  selectedValues: Map<string, string> = new Map();
  selectedVariant: ProductVariant | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['variants']) {
      this.buildVariantMap();
    }
  }

  private buildVariantMap(): void {
    this.variantsByType = new Map();
    this.selectedValues = new Map();

    for (const variant of this.variants) {
      if (!variant.isActive) continue;
      const existing = this.variantsByType.get(variant.variantType) || [];
      existing.push(variant);
      this.variantsByType.set(variant.variantType, existing);
    }

    this.variantTypes = Array.from(this.variantsByType.keys());
  }

  selectVariantValue(type: string, value: string): void {
    if (this.selectedValues.get(type) === value) {
      // Deselect
      this.selectedValues.delete(type);
    } else {
      this.selectedValues.set(type, value);
    }
    this.resolveSelectedVariant();
  }

  isSelected(type: string, value: string): boolean {
    return this.selectedValues.get(type) === value;
  }

  isOutOfStock(variant: ProductVariant): boolean {
    return variant.unitsInStock <= 0;
  }

  private resolveSelectedVariant(): void {
    // Find variant matching all selected values
    if (this.selectedValues.size === 0) {
      this.selectedVariant = null;
      this.variantSelected.emit(null);
      return;
    }

    const match = this.variants.find((v) => {
      if (!v.isActive) return false;
      return this.selectedValues.get(v.variantType) === v.variantValue;
    });

    this.selectedVariant = match || null;
    this.variantSelected.emit(this.selectedVariant);
  }

  getVariantStockLabel(variant: ProductVariant): string {
    if (variant.unitsInStock <= 0) return 'Out of stock';
    if (variant.unitsInStock <= 5) return `Only ${variant.unitsInStock} left`;
    return '';
  }

  getPriceAdjustmentLabel(variant: ProductVariant): string {
    if (!variant.priceAdjustment || variant.priceAdjustment === 0) return '';
    const sign = variant.priceAdjustment > 0 ? '+' : '';
    return `(${sign}$${variant.priceAdjustment.toFixed(2)})`;
  }
}
