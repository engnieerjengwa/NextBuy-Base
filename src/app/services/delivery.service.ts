import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';

/** Latitude / longitude for a city */
interface CityCoord {
  lat: number;
  lng: number;
  province: string;
}

/** Delivery breakdown returned by the service */
export interface DeliveryBreakdown {
  /** Total delivery cost for the order */
  totalDeliveryCost: number;
  /** Whether all items qualify for free same-province delivery */
  isFreeDelivery: boolean;
  /** Distance in km (0 if same province) */
  distanceKm: number;
  /** Description text for the user */
  description: string;
  /** Per-km rate used (0 if same province) */
  ratePerKm: number;
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  /** Rate charged per km for cross-province delivery */
  readonly RATE_PER_KM = 0.1;

  /** Free-delivery threshold for same-province orders */
  readonly FREE_DELIVERY_THRESHOLD = 50;

  /** Standard flat fee for same-province orders below threshold */
  readonly STANDARD_DELIVERY_FEE = 7.99;

  /**
   * Lookup table of city coordinates (Zimbabwe focus).
   * Keys are normalised to lowercase.
   */
  private readonly cityCoords: Record<string, CityCoord> = {
    // ---- Harare Province ----
    harare: { lat: -17.8292, lng: 31.0522, province: 'Harare' },
    chitungwiza: { lat: -18.0127, lng: 31.0755, province: 'Harare' },
    epworth: { lat: -17.89, lng: 31.13, province: 'Harare' },
    ruwa: { lat: -17.89, lng: 31.25, province: 'Harare' },

    // ---- Bulawayo Province ----
    bulawayo: { lat: -20.1325, lng: 28.6268, province: 'Bulawayo' },

    // ---- Manicaland ----
    mutare: { lat: -18.9707, lng: 32.6709, province: 'Manicaland' },
    chipinge: { lat: -20.1884, lng: 32.6248, province: 'Manicaland' },
    rusape: { lat: -18.53, lng: 32.13, province: 'Manicaland' },
    nyanga: { lat: -18.2167, lng: 32.75, province: 'Manicaland' },

    // ---- Mashonaland Central ----
    bindura: { lat: -17.3, lng: 31.33, province: 'Mashonaland Central' },
    'mt darwin': { lat: -16.78, lng: 31.58, province: 'Mashonaland Central' },
    'mount darwin': {
      lat: -16.78,
      lng: 31.58,
      province: 'Mashonaland Central',
    },
    shamva: { lat: -17.31, lng: 31.57, province: 'Mashonaland Central' },
    mazowe: { lat: -17.5, lng: 30.97, province: 'Mashonaland Central' },

    // ---- Mashonaland East ----
    marondera: { lat: -18.1854, lng: 31.5519, province: 'Mashonaland East' },
    mutoko: { lat: -17.397, lng: 32.228, province: 'Mashonaland East' },

    // ---- Mashonaland West ----
    chinhoyi: { lat: -17.3622, lng: 30.202, province: 'Mashonaland West' },
    kadoma: { lat: -18.35, lng: 29.92, province: 'Mashonaland West' },
    karoi: { lat: -16.81, lng: 29.69, province: 'Mashonaland West' },
    kariba: { lat: -16.52, lng: 28.8, province: 'Mashonaland West' },
    chegutu: { lat: -18.13, lng: 30.15, province: 'Mashonaland West' },

    // ---- Masvingo ----
    masvingo: { lat: -20.0694, lng: 30.8328, province: 'Masvingo' },
    chiredzi: { lat: -21.05, lng: 31.67, province: 'Masvingo' },

    // ---- Matabeleland North ----
    'victoria falls': {
      lat: -17.9243,
      lng: 25.8572,
      province: 'Matabeleland North',
    },
    hwange: { lat: -18.3667, lng: 26.5, province: 'Matabeleland North' },
    lupane: { lat: -18.95, lng: 27.81, province: 'Matabeleland North' },

    // ---- Matabeleland South ----
    gwanda: { lat: -20.94, lng: 29.01, province: 'Matabeleland South' },
    beitbridge: { lat: -22.2167, lng: 30.0, province: 'Matabeleland South' },
    plumtree: { lat: -20.48, lng: 27.82, province: 'Matabeleland South' },

    // ---- Midlands ----
    gweru: { lat: -19.45, lng: 29.8167, province: 'Midlands' },
    kwekwe: { lat: -18.9281, lng: 29.8144, province: 'Midlands' },
    zvishavane: { lat: -20.33, lng: 30.06, province: 'Midlands' },
    shurugwi: { lat: -19.67, lng: 30.0, province: 'Midlands' },
    redcliff: { lat: -19.03, lng: 29.78, province: 'Midlands' },
  };

  /**
   * Default province capitals used when only a province name is known.
   * Maps province name (lowercase) → city key in `cityCoords`.
   */
  private readonly provinceCapitals: Record<string, string> = {
    harare: 'harare',
    bulawayo: 'bulawayo',
    manicaland: 'mutare',
    'mashonaland central': 'bindura',
    'mashonaland east': 'marondera',
    'mashonaland west': 'chinhoyi',
    masvingo: 'masvingo',
    'matabeleland north': 'victoria falls',
    'matabeleland south': 'gwanda',
    midlands: 'gweru',
  };

  /** List of province names (display-friendly) */
  readonly provinces: string[] = [
    'Harare',
    'Bulawayo',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands',
  ];

  /** Return the list of known cities for a given province */
  getCitiesForProvince(province: string): string[] {
    const prov = province.toLowerCase();
    return Object.entries(this.cityCoords)
      .filter(([, c]) => c.province.toLowerCase() === prov)
      .map(([key]) => this.titleCase(key));
  }

  /**
   * Calculate delivery cost for the entire cart.
   *
   * Rules:
   *  1. All items sold in the SAME province as the buyer AND subtotal >= $50 → FREE
   *  2. All items sold in the SAME province as the buyer AND subtotal < $50 → standard fee ($7.99)
   *  3. Any item sold from a DIFFERENT province → $0.10/km (based on city-to-city distance)
   *
   * For simplicity the distance is computed from the warehouse city
   * (assumed the same for all items) to the buyer's city.
   */
  calculateDelivery(
    cartItems: CartItem[],
    subtotal: number,
    buyerProvince: string,
    buyerCity: string,
  ): DeliveryBreakdown {
    if (!cartItems.length || !buyerProvince) {
      return {
        totalDeliveryCost: 0,
        isFreeDelivery: false,
        distanceKm: 0,
        description: 'Select your delivery location to see shipping costs',
        ratePerKm: 0,
      };
    }

    // Determine the primary seller location (use first item — all from NexBuy warehouse)
    const sellerProvince = (
      cartItems[0].sellerProvince || 'Harare'
    ).toLowerCase();
    const sellerCity = (cartItems[0].sellerCity || 'Harare').toLowerCase();
    const buyerProv = buyerProvince.toLowerCase();
    const buyerCityNorm = buyerCity.toLowerCase();

    // Same-province logic
    if (sellerProvince === buyerProv) {
      if (subtotal >= this.FREE_DELIVERY_THRESHOLD) {
        return {
          totalDeliveryCost: 0,
          isFreeDelivery: true,
          distanceKm: 0,
          description:
            'FREE delivery (same province, order over $' +
            this.FREE_DELIVERY_THRESHOLD +
            ')',
          ratePerKm: 0,
        };
      }
      return {
        totalDeliveryCost: this.STANDARD_DELIVERY_FEE,
        isFreeDelivery: false,
        distanceKm: 0,
        description: `Standard delivery (same province, add $${(this.FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more for FREE delivery)`,
        ratePerKm: 0,
      };
    }

    // Different-province: compute distance
    const distanceKm = this.getDistanceBetweenCities(sellerCity, buyerCityNorm);
    const cost = +(distanceKm * this.RATE_PER_KM).toFixed(2);

    return {
      totalDeliveryCost: cost,
      isFreeDelivery: false,
      distanceKm: Math.round(distanceKm),
      description: `Cross-province delivery: ${Math.round(distanceKm)} km × $${this.RATE_PER_KM.toFixed(2)}/km`,
      ratePerKm: this.RATE_PER_KM,
    };
  }

  /** Distance (km) between two cities using Haversine formula */
  getDistanceBetweenCities(fromCity: string, toCity: string): number {
    const from = this.resolveCoord(fromCity);
    const to = this.resolveCoord(toCity);

    if (!from || !to) {
      // Fallback: return a default inter-province distance of 300 km
      return 300;
    }

    return this.haversine(from.lat, from.lng, to.lat, to.lng);
  }

  // ---- private helpers ----

  /** Resolve a city name (or province name) to coordinates */
  private resolveCoord(name: string): CityCoord | null {
    const key = name.toLowerCase().trim();
    // Direct city match
    if (this.cityCoords[key]) {
      return this.cityCoords[key];
    }
    // Try as province name → use its capital
    const capitalKey = this.provinceCapitals[key];
    if (capitalKey && this.cityCoords[capitalKey]) {
      return this.cityCoords[capitalKey];
    }
    return null;
  }

  /** Haversine distance in km */
  private haversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private titleCase(str: string): string {
    return str
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
