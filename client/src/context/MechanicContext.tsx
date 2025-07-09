import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Mechanic } from '../types/bikeTypes';

interface MechanicContextType {
  mechanic: Mechanic | null;
  setMechanic: (mechanic: Mechanic) => void;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

export const useMechanic = () => {
  const context = useContext(MechanicContext);
  if (!context) throw new Error('useMechanic must be used within MechanicProvider');
  return context;
};

export const MechanicProvider = ({ children }: { children: ReactNode }) => {
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  return (
    <MechanicContext.Provider value={{ mechanic, setMechanic }}>
      {children}
    </MechanicContext.Provider>
  );
};
