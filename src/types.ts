export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatarSeed: number;
  preferredCurrency: Currency;
};

export type TripCategory =
  | 'Stay'
  | 'Food'
  | 'Transport'
  | 'Fun'
  | 'Shopping'
  | 'Misc';

export type SplitType = 'equal' | 'unequal' | 'percentage' | 'exact';

export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverDoodle: string;
  members: string[];
};

export type SplitDetail = {
  userId: string;
  share: number;
};

export type Expense = {
  id: string;
  tripId: string;
  amount: number;
  description: string;
  payerId: string;
  category: TripCategory;
  date: string;
  notes: string;
  splitType: SplitType;
  splitDetails: SplitDetail[];
  createdBy: string;
  createdAt: string;
};

export type Settlement = {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: string;
  note: string;
};

export type ActivityType = 'expense_added' | 'expense_edited' | 'settlement_added' | 'invite_sent';

export type ActivityItem = {
  id: string;
  tripId: string;
  actorId: string;
  type: ActivityType;
  message: string;
  date: string;
  refId?: string;
};

export type NotificationType =
  | 'trip_created'
  | 'invite_received'
  | 'expense_added'
  | 'delete_request'
  | 'delete_result';

export type Notification = {
  id: string;
  toUserId: string;
  tripId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  meta?: Record<string, string>;
};

export type DeleteKind = 'trip' | 'expense';

export type DeleteProposalStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export type DeleteProposal = {
  id: string;
  kind: DeleteKind;
  tripId: string;
  targetId: string;
  requestedBy: string;
  createdAt: string;
  status: DeleteProposalStatus;
  memberIds: string[];
  approvals: Record<string, 'pending' | 'approved' | 'rejected'>;
};

export type AppState = {
  users: User[];
  trips: Trip[];
  expenses: Expense[];
  settlements: Settlement[];
  activities: ActivityItem[];
  notifications: Notification[];
  deleteProposals: DeleteProposal[];
  currentUserId: string | null;
  selectedTripId: string | null;
};
