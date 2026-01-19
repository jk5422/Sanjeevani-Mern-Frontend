import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-white lg:flex">
                <Sidebar />
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
