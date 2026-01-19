import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings } from 'lucide-react';

export const Sidebar = ({ className }: { className?: string }) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    const links = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/billing', label: 'Billing (POS)', icon: ShoppingCart },
        { href: '/inventory', label: 'Inventory', icon: Package },
        ...(isAdmin ? [{ href: '/users', label: 'User Management', icon: Users }] : []),
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={cn("pb-12 h-full border-r bg-card", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
                        Sanjeevani ERP
                    </h2>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                    )
                                }
                            >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
