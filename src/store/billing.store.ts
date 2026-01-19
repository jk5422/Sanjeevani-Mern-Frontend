import { create } from 'zustand';

export interface BillItem {
    productBatchId: number;
    productId: number;
    name: string;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    mrp: number; // Snapshot
    dp: number;  // Price
    sp: number;  // Points
    currentStock: number;
    // Derived
    lineTotal: number;
    lineSp: number;
}

export interface BillCustomer {
    id?: number;
    name: string;
    mobile: string;
    ascplId?: string; // Optional
    isNew?: boolean; // If being created inline
}

export interface BillPayment {
    mode: 'CASH' | 'ONLINE' | 'UPI';
    amount: number;
    refNo?: string;
}

interface BillingState {
    items: BillItem[];
    customer: BillCustomer | null;
    referencePartyAscplId: string | null;
    payments: BillPayment[];

    // Derived Totals (Getters usually, but we can store them for ease)
    totalAmount: number;
    totalSp: number;
    totalPaid: number;
    dueAmount: number;

    // Actions
    addItem: (item: Omit<BillItem, 'quantity' | 'lineTotal' | 'lineSp'>) => void;
    updateItemQty: (batchId: number, quantity: number) => void;
    removeItem: (batchId: number) => void;
    setCustomer: (customer: BillCustomer | null) => void;
    setReferenceParty: (ascplId: string | null) => void;
    addPayment: (payment: BillPayment) => void;
    removePayment: (index: number) => void;
    reset: () => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
    items: [],
    customer: null,
    referencePartyAscplId: null,
    payments: [],

    totalAmount: 0,
    totalSp: 0,
    totalPaid: 0,
    dueAmount: 0,

    addItem: (newItem) => {
        const { items } = get();
        const existing = items.find(i => i.productBatchId === newItem.productBatchId);

        let newItems;
        if (existing) {
            // Increment logic
            const newQty = existing.quantity + 1;
            if (newQty > existing.currentStock) return; // Prevent over-stock

            newItems = items.map(i =>
                i.productBatchId === newItem.productBatchId
                    ? { ...i, quantity: newQty, lineTotal: newQty * i.dp, lineSp: newQty * i.sp }
                    : i
            );
        } else {
            newItems = [...items, {
                ...newItem,
                quantity: 1,
                lineTotal: newItem.dp,
                lineSp: newItem.sp
            }];
        }

        set((state) => calculateTotals({ ...state, items: newItems }));
    },

    updateItemQty: (batchId, quantity) => {
        if (quantity < 1) return;
        const { items } = get();
        const item = items.find(i => i.productBatchId === batchId);
        if (!item) return;

        if (quantity > item.currentStock) return; // Cap at stock

        const newItems = items.map(i =>
            i.productBatchId === batchId
                ? { ...i, quantity, lineTotal: quantity * i.dp, lineSp: quantity * i.sp }
                : i
        );
        set((state) => calculateTotals({ ...state, items: newItems }));
    },

    removeItem: (batchId) => {
        const newItems = get().items.filter(i => i.productBatchId !== batchId);
        set((state) => calculateTotals({ ...state, items: newItems }));
    },

    setCustomer: (customer) => set({ customer }),
    setReferenceParty: (ascplId) => set({ referencePartyAscplId: ascplId }),

    addPayment: (payment) => {
        const newPayments = [...get().payments, payment];
        set((state) => calculateTotals({ ...state, payments: newPayments }));
    },

    removePayment: (index) => {
        const newPayments = get().payments.filter((_, i) => i !== index);
        set((state) => calculateTotals({ ...state, payments: newPayments }));
    },

    reset: () => set({
        items: [], customer: null, referencePartyAscplId: null, payments: [],
        totalAmount: 0, totalSp: 0, totalPaid: 0, dueAmount: 0
    }),
}));

// Helper to calc totals
const calculateTotals = (state: Pick<BillingState, 'items' | 'payments'>) => {
    const totalAmount = state.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const totalSp = state.items.reduce((sum, i) => sum + i.lineSp, 0);
    const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);
    const dueAmount = totalAmount - totalPaid;

    return { totalAmount, totalSp, totalPaid, dueAmount };
};
