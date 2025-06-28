// Sdílené typy pro celý projekt

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Bike {
  id: string;
  name: string;
  brand: string;
  year: number;
  ownerId: string;
}
