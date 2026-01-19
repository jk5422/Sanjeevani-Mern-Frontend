import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBillingStore } from '@/store/billing.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Search, PlusCircle, X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';

export const CustomerSearch = () => {
    const { customer, setCustomer } = useBillingStore();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const response = await api.get('/billing/customers/search', {
                params: { term: debouncedQuery }
            });
            return response.data;
        },
        enabled: debouncedQuery.length > 2,
    });

    const handleSelect = (c: any) => {
        setCustomer({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
            ascplId: c.ascplId,
            isNew: false
        });
        setOpen(false);
        setQuery('');
    };

    const clearCustomer = () => {
        setCustomer(null);
    };

    if (customer) {
        return (
            <Card className="mb-4 bg-muted/20">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium leading-none">{customer.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {customer.mobile}
                                {customer.ascplId && <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">ID: {customer.ascplId}</span>}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearCustomer}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex gap-2 mb-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between text-muted-foreground">
                        Search customer by name or mobile...
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Name, Mobile, or ID..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            {isLoading && <CommandItem>Searching...</CommandItem>}
                            {!isLoading && query.length > 2 && customers?.length === 0 && (
                                <CommandEmpty className="py-2 px-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">No customer found</p>
                                    <Button size="sm" variant="secondary" className="w-full" onClick={() => alert("Add Customer Modal Todo")}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create "{query}"
                                    </Button>
                                </CommandEmpty>
                            )}
                            <CommandGroup>
                                {customers?.map((c: any) => (
                                    <CommandItem
                                        key={c.id}
                                        value={c.name}
                                        onSelect={() => handleSelect(c)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-xs text-muted-foreground">{c.mobile}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Button variant="secondary" onClick={() => alert("Add Customer Modal Todo")}>
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
    );
};
