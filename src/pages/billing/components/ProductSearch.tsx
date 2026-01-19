import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBillingStore } from '@/store/billing.store';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce'; // We might need to create this hook

export const ProductSearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300); // 300ms delay
    const addItem = useBillingStore((state) => state.addItem);

    // Fetch Products
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const response = await api.get('/inventory/products/search', {
                params: { term: debouncedQuery }
            });
            return response.data; // Assuming API returns array directly or inside data
        },
        enabled: debouncedQuery.length > 1,
    });

    // We also need batches for the selected product to pick price/expiry
    // For MVP, we might auto-pick the first batch or show a sub-menu.
    // Let's assume for speed: "Add" adds the oldest batch (FIFO) OR we show batches.
    // To make it simple keyboard driven: Enter -> Auto-picks best batch (oldest).

    const handleSelect = async (product: any) => {
        // Fetch batches for this product
        // Ideally this should be instant. 
        // For MVP, lets assume we fetch batches ON selection or pre-fetch.
        try {
            const batchRes = await api.get('/inventory/batches', {
                params: { productId: product.id, shopeeId: 1 } // Hardcoded shopee for now or from user
            });
            const batches = batchRes.data;

            if (batches && batches.length > 0) {
                // FIFO: Pick first available
                const batch = batches[0];
                addItem({
                    productBatchId: batch.id,
                    productId: product.id,
                    name: product.name,
                    batchNo: batch.batchNo,
                    expiryDate: batch.expiryDate,
                    mrp: batch.mrp,
                    dp: batch.dp,
                    sp: batch.sp,
                    currentStock: batch.currentStock
                });
                setOpen(false);
                setQuery('');
            } else {
                alert("No stock available for this product");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {query ? query : "Search product by name or code..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search products..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {isLoading && <CommandItem>Searching...</CommandItem>}
                        {!isLoading && products?.length === 0 && <CommandEmpty>No product found.</CommandEmpty>}
                        <CommandGroup>
                            {products?.map((product: any) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => handleSelect(product)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">{product.shortName} | Stock: ?</span>
                                    </div>
                                    <Check className={cn("ml-auto h-4 w-4", "opacity-0")} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
