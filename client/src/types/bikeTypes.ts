import type { Bike as SharedBike } from '../../../shared/types';

// Typ pro mechanika
export type Mechanic = {
  id: string;
  name: string;
};

// Typ pro kolo (rozšířený o servisní data)
export type Bike = SharedBike & {
  mechanicId?: string;
  status?: 'OK' | 'NOT_OK';
  parts?: string;
  kilometers?: number;
  serviceType?: 'UVODNI' | 'KOMPLEXNI' | 'QUICK_FIX';
  startedAt?: string;
  durationMinutes?: number;
  quickFix?: boolean;
};
