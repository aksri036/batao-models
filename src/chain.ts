export interface BtChain {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  settings: {
    shareRewards: boolean;
  };
}

/**
 * Funtionalities:
 * 1. Dashboard - view my stores and edit them
 * 2. view reports across stores
 * 3. Subscription will be managed individually in store
 */
