import { useState } from 'react';
import { useBillingStore } from '@/store/billing.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const PaymentWidget = () => {
    const { totalAmount, totalPaid, dueAmount, addPayment, payments, removePayment } = useBillingStore();
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState<'CASH' | 'ONLINE' | 'UPI'>('CASH');
    const [refNo, setRefNo] = useState('');

    const handleAdd = () => {
        const val = Number(amount);
        if (!val || val <= 0) return;
        if (val > dueAmount) {
            alert("Amount exceeds due amount"); // MVP Alert
            return;
        }

        addPayment({ amount: val, mode, refNo });
        setAmount('');
        setRefNo('');
    };

    const handleFullPay = () => {
        if (dueAmount > 0) {
            setAmount(dueAmount.toString());
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-muted p-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payable</p>
                    <p className="text-2xl font-bold">₹{totalAmount}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground mr-1">Due Amount</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-xl font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            ₹{dueAmount}
                        </p>
                        {dueAmount === 0 && <Badge variant="default" className="bg-green-600">PAID</Badge>}
                    </div>
                </div>
            </div>

            {/* Payment Input */}
            {dueAmount > 0 && (
                <div className="grid gap-2">
                    <div className="flex gap-2">
                        <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="ONLINE">Online</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={handleFullPay} className="text-xs">
                            Full
                        </Button>
                    </div>
                    {mode !== 'CASH' && (
                        <Input
                            placeholder="Reference No. (Optional)"
                            value={refNo}
                            onChange={(e) => setRefNo(e.target.value)}
                        />
                    )}
                    <Button onClick={handleAdd} disabled={!amount || Number(amount) <= 0}>Add Payment</Button>
                </div>
            )}

            {/* Payment History List */}
            {payments.length > 0 && (
                <div className="border rounded-md p-2 space-y-2 max-h-[150px] overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Recorded Payments</p>
                    {payments.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                            <div className="flex gap-2 items-center">
                                <Badge variant="outline">{p.mode}</Badge>
                                <span>₹{p.amount}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removePayment(i)}>
                                <span className="sr-only">Delete</span>
                                &times;
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
