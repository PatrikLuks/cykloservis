// Sdílené typy pro celý projekt

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Bike {
  id: string; // FE-friendly id, může být mapováno z _id
  userId: string;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  createdAt?: string;
}

export interface ServiceRecord {
  _id: string;
  userId: string;
  bikeId?: string;
  date: string;
  description: string;
  photos?: string[];
  notes?: string;
  bikeModel?: string;
  bikeBrand?: string;
  reminder?: boolean;
  createdAt?: string;
  price?: number;
  serviceType?: string;
  updatedAt?: string;
  history?: Array<{
    date: string;
    changes: Record<string, { from: any; to: any }>;
    author?: string | { name?: string; email?: string };
  }>;
  recordType?: 'údržba' | 'oprava' | 'upgrade' | 'garanční servis' | 'jiné';
  status?: 'nový' | 'čeká na díly' | 'probíhá' | 'hotovo' | 'předáno' | 'reklamace';
}

export interface ShareToken {
  _id: string;
  userId: string;
  bikeId?: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}
