import { Deal } from '../services/deal.service';

export interface SaleEvent {
  id: number;
  name: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  bannerColor: string;
  startTime: string;
  endTime: string;
  timeRemainingMs: number;
  isActive: boolean;
  deals: Deal[];
}
