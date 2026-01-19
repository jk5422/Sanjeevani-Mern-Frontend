import { useAuthStore } from '../../store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back, {user?.firstName} {user?.lastName} ({user?.role})
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/billing')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Bill</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">POS</div>
                        <p className="text-xs text-muted-foreground">
                            Create new invoice
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/inventory')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage</div>
                        <p className="text-xs text-muted-foreground">
                            Stock & Batches
                        </p>
                    </CardContent>
                </Card>

                {/* Admin Only Stats */}
                {isAdmin && (
                    <>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/users')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Admin</div>
                                <p className="text-xs text-muted-foreground">
                                    Manage Staff
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹0.00</div>
                                <p className="text-xs text-muted-foreground">
                                    +0% from yesterday
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};
