const Dashboard = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
                    <p className="text-3xl font-bold text-blue-600">$12,450.00</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-2">Orders Today</h2>
                    <p className="text-3xl font-bold text-green-600">42</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-2">New Customers</h2>
                    <p className="text-3xl font-bold text-purple-600">18</p>
                </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center border-b pb-2">
                        <span>New order #1234 by John Doe</span>
                        <span className="text-sm text-gray-500">2 mins ago</span>
                    </li>
                    <li className="flex justify-between items-center border-b pb-2">
                        <span>Product "Leather Jacket" updated</span>
                        <span className="text-sm text-gray-500">1 hour ago</span>
                    </li>
                    <li className="flex justify-between items-center border-b pb-2">
                        <span>Customer "Jane Smith" registered</span>
                        <span className="text-sm text-gray-500">3 hours ago</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
