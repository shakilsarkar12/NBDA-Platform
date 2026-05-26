export interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bloodGroup: string;
  isAvailable: boolean;
  lastDonationDate?: string;
  createdAt: string;
  updatedAt: string;
}
