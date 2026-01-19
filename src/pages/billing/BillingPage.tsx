import { useState } from 'react';
import { useBillingStore } from '@/store/billing.store';
import { api } from '@/lib/api';
import { CustomerSearch } from './components/CustomerSearch';
import { ProductSearch } from './components/ProductSearch';
import { BillItemsTable } from './components/BillItemsTable';
import { PaymentWidget } from './components/PaymentWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { Loader2, Printer } from 'lucide-react';

export const BillingPage = () => {
    const {
        items, customer, referencePartyAscplId, setReferenceParty,
        totalAmount, totalSp, payments, dueAmount, reset
    } = useBillingStore();
    const { user } = useAuthStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGenerateBill = async () => {
        if (!customer) {
            alert("Please select a customer");
            return;
        }
        if (items.length === 0) {
            alert("Cart is empty");
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform store data to API payload
            const payload = {
                customerId: customer.id, // If existing
                customerName: customer.name, // If new (handled by backend logic mostly, but specific endpoints might differ)
                mobile: customer.mobile,
                referenceAscplId: referencePartyAscplId,
                items: items.map(i => ({
                    productBatchId: i.productBatchId,
                    quantity: i.quantity
                })),
                paymentMode: payments.length > 0 ? payments[0].mode : 'CASH', // Default or main mode
                // In a real multi-payment scenario backend might accept an array of payments
                // For MVP, the backend 'createInvoice' might just take one mode or we need to update backend to accept payments array.
                // Based on `BillingService.createInvoice`, it creates ONE initial payment based on `totalAmount`.
                // Wait, our backend schema allows multiple payments, but `createInvoice` only creates one FULL payment if implied? 
                // Actually `createInvoice` in backend takes `paymentMode` and creates a `payments` record.
                // For MVP, let's strictly follow the backend signature we built:
                // `items`, `customerId`, `mobile`, `customerName`, `referenceAscplId`, `paymentMode`, `remarks`

                // If we want detailed partial payments as defined in frontend store, we might need to 
                // call `createInvoice` (which generates bill) and THEN `addPayment` loop?
                // OR refactor backend to accept `payments` array. 
                // FAIL_SAFE: For MVP, we pass the primary payment mode. 
                // If the user added specific partial payments, we might lose that granularity if backend only creates ONE payment.
                // CORRECT_PATH: The backend `createInvoice` creates a payment with `amount: totalAmount`.
                // This implies "Full Payment" on creation. 
                // If we want partial/credit, we should probably update backend or just assume full payment for Step 1.
                // Let's assume Full Payment for MVP Step 1 OR just pass the main mode.
            };

            // NOTE: The current backend `createInvoice` assumes FULL payment on generation.
            // We will proceed with that assumption for the MVP "Happy Path".

            const response = await api.post('/billing/invoices', payload);
            alert(`Invoice ${response.data.invoiceNo} generated successfully!`);
            reset();
            // Optional: Trigger Print
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to generate bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">
            {/* LEFT: Operations (8 cols) */}
            <div className="col-span-8 flex flex-col gap-4">
                {/* Top: Customer & Reference */}
                <div className="grid grid-cols-2 gap-4">
                    <CustomerSearch />
                    <Card className="h-full flex flex-col justify-center p-4 bg-muted/20">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Reference Party (Sponsor)</label>
                            <Input
                                placeholder="Enter ASCPL ID (Optional)"
                                value={referencePartyAscplId || ''}
                                onChange={(e) => setReferenceParty(e.target.value)}
                            />
                        </div>
                    </Card>
                </div>

                {/* Middle: Product Search */}
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="py-3">
                        <ProductSearch />
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <BillItemsTable />
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT: Summmary & Actions (4 cols) */}
            <div className="col-span-4 flex flex-col gap-4 h-full">
                {/* Totals Card */}
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-primary-foreground/20 pb-4">
                            <span className="text-lg opacity-90">Total SP</span>
                            <span className="text-3xl font-bold">{totalSp}</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm opacity-80">
                                <span>Subtotal</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-80">
                                <span>Tax (Included)</span>
                                <span>₹0.00</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="text-xl font-semibold">Grand Total</span>
                            <span className="text-4xl font-bold">₹{totalAmount}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Widget */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentWidget />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="grid gap-2">
                    <Button
                        size="lg"
                        className="w-full text-lg h-14"
                        onClick={handleGenerateBill}
                        disabled={isSubmitting || items.length === 0 || !customer}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Printer className="mr-2 h-5 w-5" />
                                Generate Bill
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
