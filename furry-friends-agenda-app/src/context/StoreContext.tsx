import React, { createContext, useContext } from 'react';

import {
  ClientProvider,
  useClients,
} from '@/context/clients/ClientContext';
import {
  GroomerProvider,
  useGroomers,
} from '@/context/groomers/GroomerContext';
import { PetProvider, usePets } from '@/context/pets/PetContext';

const useCombinedStore = () => {
  return {
    ...useClients(),
    ...useGroomers(),
    ...usePets(),
  };
};

const StoreContext = createContext<ReturnType<typeof useCombinedStore> | null>(
  null,
);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const StoreProviderContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeValue = useCombinedStore();

  return (
    <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
  );
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ClientProvider>
      <GroomerProvider>
        <PetProvider>
          <StoreProviderContent>{children}</StoreProviderContent>
        </PetProvider>
      </GroomerProvider>
    </ClientProvider>
  );
};
