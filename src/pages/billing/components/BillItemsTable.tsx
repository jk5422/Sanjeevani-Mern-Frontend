import { useBillingStore } from '@/store/billing.store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

export const BillItemsTable = () => {
    const { items, updateItemQty, removeItem } = useBillingStore();

    if (items.length === 0) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                <p>No items in cart</p>
                <p className="text-sm">Scan product or search above to add</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border h-[400px] overflow-y-auto">
            <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="w-[100px] text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">SP</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.productBatchId}>
                            <TableCell>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">ID: {item.productId}</div>
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                                {item.batchNo}
                                <br />
                                <span className="text-[10px] text-muted-foreground">Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                            </TableCell>
                            <TableCell className="text-right">₹{item.dp}</TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    min="1"
                                    max={item.currentStock}
                                    value={item.quantity}
                                    onChange={(e) => updateItemQty(item.productBatchId, parseInt(e.target.value) || 1)}
                                    className="h-8 md:text-center"
                                />
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{item.lineTotal}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{item.lineSp}</TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => removeItem(item.productBatchId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
