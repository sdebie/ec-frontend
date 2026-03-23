import {DollarSign, ShoppingBag, Users as UsersIcon, ArrowRight} from 'lucide-react';
import {PageContainer} from "@/components";
import {StatCard} from "@/components/shared/card";

export function Dashboard() {
    return (
        <PageContainer
            title="Dashboard Overview"
            description="Welcome back, here's what's happening with your store today."
            action={
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-primary/50 outline-none">
                    Download Report
                </button>
            }
        >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard
                    title="Total Sales"
                    value="$24,780.00"
                    trend="+12%"
                    trendDirection="up"
                    icon={<DollarSign className="w-5 h-5"/>}
                />
                <StatCard
                    title="Orders Today"
                    value="456"
                    trend="+4.2%"
                    trendDirection="up"
                    icon={<ShoppingBag className="w-5 h-5"/>}
                />
                <StatCard
                    title="New Customers"
                    value="89"
                    trend="-2.1%"
                    trendDirection="down"
                    icon={<UsersIcon className="w-5 h-5"/>}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Chart Area */}
                <div
                    className="lg:col-span-2 bg-admin-panel border border-admin-border rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] p-6 min-h-100">
                    <h2 className="text-lg font-semibold text-admin-text mb-4">Revenue Over Time</h2>
                    <div
                        className="flex items-center justify-center h-64 border-2 border-dashed border-admin-border rounded-lg bg-admin-sidebar-hover">
                        <p className="text-admin-text-muted">Chart placeholder</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div
                    className="bg-admin-panel border border-admin-border rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-admin-text">Recent Orders</h2>
                        <button className="text-sm font-medium text-primary hover:text-primary-hover">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i}
                                 className="flex items-center justify-between p-3 rounded-lg hover:bg-admin-sidebar-hover border border-transparent hover:border-admin-border transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full bg-admin-bg flex items-center justify-center text-sm font-medium border border-admin-border">
                                        {`#${1000 + i}`}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-admin-text">Order {`#${1000 + i}`}</p>
                                        <p className="text-xs text-admin-text-muted">2 mins ago</p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-admin-text flex items-center gap-2">
                                    ${(Math.random() * 100).toFixed(2)}
                                    <ArrowRight
                                        className="w-4 h-4 text-admin-text-muted opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default Dashboard;

