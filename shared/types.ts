// Sdílené typy pro celý projekt

export type Permission =
  | 'manage_team'
  | 'manage_services'
  | 'view_stats'
  | 'manage_settings'
  | 'create_reservation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'serviceman' | 'customer';
  services?: string[]; // id servisů, ke kterým je uživatel přiřazen
  notificationPreferences?: NotificationPreferences;
  permissions?: Permission[];
}

// Rozšíření typu Bike o volitelná pole pro FE
export interface Bike {
  id: string; // FE-friendly id, může být mapováno z _id
  userId: string;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  createdAt?: string;
  status?: 'OK' | 'NOT_OK';
  parts?: string;
  kilometers?: number;
  serviceType?: 'UVODNI' | 'KOMPLEXNI' | 'QUICK_FIX';
  quickFix?: boolean;
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
  stravaActivityId?: string; // volitelné propojení s aktivitou ze Stravy
  quickFix?: boolean;
  durationMinutes?: number;
  repairStart?: string; // Začátek opravy (ISO string)
  timingType?: 'manual' | 'auto'; // Typ měření času
}

export interface ShareToken {
  _id: string;
  userId: string;
  bikeId?: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  types: string[]; // např. ['reservation', 'team', 'system']
}
