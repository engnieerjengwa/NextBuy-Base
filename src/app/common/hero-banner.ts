export class HeroBanner {
    id!: number;
    title!: string;
    subtitle!: string;
    ctaText!: string;
    ctaLink!: string;
    imageUrl!: string;
    videoUrl!: string;
    disclaimer!: string;
    isActive: boolean;
    startDate!: Date;
    endDate!: Date;
    displayOrder: number;
    dateCreated!: Date;
    lastUpdated!: Date;

    constructor() {
        // Initialize with default values
        this.isActive = true;
        this.displayOrder = 0;
    }
}
