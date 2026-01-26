export class ProductCategory {
    id: number;
    categoryName: string;
    slug: string;
    iconUrl: string;
    isActive: boolean;
    displayOrder: number;
    parent: ProductCategory | null;
    children: ProductCategory[];

    constructor(
        id: number = 0,
        categoryName: string = '',
        slug: string = '',
        iconUrl: string = '',
        isActive: boolean = true,
        displayOrder: number = 0,
        parent: ProductCategory | null = null,
        children: ProductCategory[] = []
    ) {
        this.id = id;
        this.categoryName = categoryName;
        this.slug = slug;
        this.iconUrl = iconUrl;
        this.isActive = isActive;
        this.displayOrder = displayOrder;
        this.parent = parent;
        this.children = children;
    }
}
