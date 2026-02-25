import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImage } from '../../common/product';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css'],
})
export class ImageGalleryComponent implements OnChanges {
  @Input() images: ProductImage[] = [];
  @Input() productName: string = '';
  @Input() fallbackImageUrl: string = '';

  displayImages: { url: string; alt: string }[] = [];
  selectedIndex: number = 0;
  isZoomed: boolean = false;
  zoomX: number = 50;
  zoomY: number = 50;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] || changes['fallbackImageUrl']) {
      this.buildDisplayImages();
    }
  }

  private buildDisplayImages(): void {
    if (this.images && this.images.length > 0) {
      this.displayImages = this.images
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((img) => ({
          url: img.imageUrl,
          alt: img.altText || this.productName,
        }));
    } else if (this.fallbackImageUrl) {
      this.displayImages = [
        { url: this.fallbackImageUrl, alt: this.productName },
      ];
    } else {
      this.displayImages = [];
    }
    this.selectedIndex = 0;
  }

  get currentImage(): { url: string; alt: string } | null {
    return this.displayImages[this.selectedIndex] || null;
  }

  selectImage(index: number): void {
    this.selectedIndex = index;
    this.isZoomed = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isZoomed) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.zoomX = ((event.clientX - rect.left) / rect.width) * 100;
    this.zoomY = ((event.clientY - rect.top) / rect.height) * 100;
  }

  onMouseEnter(): void {
    this.isZoomed = true;
  }

  onMouseLeave(): void {
    this.isZoomed = false;
  }

  prevImage(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.displayImages.length - 1;
    }
  }

  nextImage(): void {
    if (this.selectedIndex < this.displayImages.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
  }
}
