import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components";
import { getProductImportRows, ProductUploadStaged } from "@/services/ProductService.ts";

const ProductImportReview = () => {
    const { batchId } = useParams();
    const [stagedData, setStagedData] = useState<ProductUploadStaged[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (batchId) {
            getProductImportRows(batchId)
                .then(setStagedData)
                .finally(() => setLoading(false));
        }
    }, [batchId]);

    const handleApprove = async () => {
        // await axios.post(`/api/admin/products/approve-batch/${batchId}`);
        // alert("Batch applied successfully!");
        // navigate('/admin/products');
    };

    if (loading) return <div className="p-10 text-white">Loading comparison data...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Review Changes (Batch: {batchId?.slice(0,8)})</h2>
                <div className="space-x-4">
                    <Button onClick={() => navigate(-1)} className="bg-slate-700">Cancel</Button>
                    <Button onClick={handleApprove} className="bg-green-600 font-bold">Apply All Changes</Button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Retail Price</th>
                        <th className="p-4">Wholesale Price</th>
                        <th className="p-4">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                    {stagedData.map((row) => (
                        <tr key={row.id} className={row.hasChanges ? "bg-blue-500/5" : ""}>
                            <td className="p-4 font-mono text-blue-400">{row.sku}</td>
                            <td className="p-4 text-white">
                                {row.proposedName}
                                {!row.isNewProduct && row.currentName && row.currentName !== row.proposedName && (
                                    <div className="text-[12px] text-slate-500 line-through">{row.currentName}</div>
                                )}
                            </td>
                            <td className="p-4">
                                <span className="text-slate-300">R{row.proposedRetailPrice}</span>
                                {!row.isNewProduct && row.currentRetailPrice !== row.proposedRetailPrice && (
                                    <div>
                                        <span className="text-[12px] text-yellow-500 line-through">R{row.currentRetailPrice}</span>
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                <span className="text-slate-300">R{row.proposedWholesalePrice}</span>
                                {!row.isNewProduct && row.currentWholesalePrice !== row.proposedWholesalePrice && (
                                    <div>
                                        <span className="text-[12px] text-yellow-500 line-through">R{row.currentWholesalePrice}</span>
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                {row.isNewProduct ? (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">NEW</span>
                                ) : row.hasChanges ? (
                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">UPDATE</span>
                                ) : (
                                    <span className="text-slate-500">No Change</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductImportReview;
