
const FloatingSection = () => {
    return (
        /* top-16: Adjust this to match your AdminHeader height
           z-40: Just below the main header z-50
        */
        <div className="sticky top-16 left-0 w-50 bg-slate-700 text-white py-2 px-4 shadow-md z-40 border-b border-slate-600">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">Products</span>
                    <span>/</span>
                    <span className="font-bold">Edit Product</span>
                </div>
            </div>
        </div>
    );
};

export default FloatingSection;