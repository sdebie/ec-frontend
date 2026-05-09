import { ColumnDef } from "@tanstack/react-table";
import {Eye} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {Button} from "@/components";
import { DataTable } from "@/components/shared/datatable/DataTable.tsx";
import { OrderStatusDisplay } from "@/constants/enums/OrderStatusDisplay.tsx";
import useOrderList from "@/pages/admin/orders/hooks/useOrderList.ts";
import { OrderData } from "@/types/order.types.ts";

const OrderList = () => {
    const navigate = useNavigate();
    const {
        orders,
        isLoading,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        onPageChange,
        onPageSizeChange,
        onSearchChange,
    } = useOrderList();

    const handleDetail = (order: OrderData) => {
        if (order.id) {
            navigate(`/admin/order/detail/${order.id}`);
        }
    }

    const columns: ColumnDef<OrderData>[] = useMemo(
        () => [
            {
                id: "createDate",
                accessorKey: "createDate",
                header: "Create Date",
                enableSorting: false,
                cell: ({ row }) => {
                    const value = row.original.createDate;
                    return value ? new Date(value).toLocaleString() : "-";
                },
            },
            {
                id: "email",
                accessorKey: "customer.email",
                header: "Customer",
                enableSorting: false,
                cell: ({ row }) => {
                    const value = row.original.customer?.email;
                    return value || "-";
                },
            },
            {
                id: "items",
                accessorKey: "itemCount",
                header: "Items",
                enableSorting: false,
                cell: ({ row }) => row.original.itemCount ?? row.original.items?.length ?? 0,
            },
            {
                id: "status",
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                cell: ({ row }) => <OrderStatusDisplay status={row.original.status ?? ""} />,
            },
            {
                id: "totalAmount",
                accessorKey: "totalAmount",
                header: "Total",
                enableSorting: false,
                cell: ({ row }) => {
                    const total = Number(row.original.totalAmount ?? 0);
                    return `R ${total.toFixed(2)}`;
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: (props) => (
                    <div className={"flex items-start justify-center gap-2"}>
                        <Button variant="solid" size={"sm"} onClick={() => handleDetail(props.row.original)}>
                            <Eye size={12}/>
                        </Button>
                    </div>
                )
            }
        ],
        []
    );

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Orders</h1>
            <DataTable<OrderData>
                data={orders}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search order status..."
                manualPagination
                serverPageIndex={pageIndex}
                serverPageSize={pageSize}
                serverTotalRows={totalRows}
                serverPageCount={pageCount}
                onServerPageChange={onPageChange}
                onServerPageSizeChange={onPageSizeChange}
                onServerSearchChange={onSearchChange}
            />
        </>
    );
};

export default OrderList;