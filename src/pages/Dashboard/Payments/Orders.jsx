import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import UpdateOrderStatusModal from "~/components/Dashboard/Payments/UpdateOrderStatusModal";
import ViewOrderModal from "~/components/Dashboard/Payments/ViewOrderModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import StatusChip from "~/components/Global/StatusChip/StatusChip";
import Table from "~/components/Global/Table/Table";
import { useGetAllOrdersQuery, useGetOrderStatsQuery, useUpdateOrderMutation } from "~/redux/api/ordersApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState("");
  const { data: orders, isLoading } = useGetAllOrdersQuery({ page: currentPage, limit: perPage, searchBy });
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const { data: stats } = useGetOrderStatsQuery();

  const orderStats = useMemo(
    () => ({
      // totalAmount: stats?.totalAmount,
      totalOrders: stats?.totalOrders,
      totalPending: stats?.totalPending,
      totalShipped: stats?.totalShipped,
      totalDelivered: stats?.totalDelivered,
      totalCanceled: stats?.totalCanceled,
    }),
    [stats]
  );

  const COLUMNS = [
    { header: "Reference", accessor: "paymentReference" },
    { header: "Date", accessor: "createdAt" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Total Items", accessor: "totalItems" },
    { header: "Ordered By", accessor: "user.fullName" },
    { header: "Shipping Address", accessor: "shippingAddress" },
    { header: "Status", accessor: "status" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "status" ? (
        <StatusChip status={value} />
      ) : col.accessor === "createdAt" ? (
        formatDate(value).dateTime
      ) : col.accessor === "totalAmount" ? (
        formatCurrency(value, item.currency)
      ) : col.accessor === "totalItems" ? (
        item.products?.reduce((acc, prod) => acc + prod.quantity, 0)
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const handleUpdate = (payload) => {
    updateOrder({ body: payload, id: selectedOrder?._id })
      .unwrap()
      .then(() => {
        toast.success("Order status UPDATED successfully");
        setOpenUpdate(false);
        setSelectedOrder(null);
      });
  };

  return (
    <div>
      <PageHeader title="Order" subtitle="Manage all orders (purchases from store)" />

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(orderStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{(key.includes("Amount") ? formatCurrency(value) : value) || 0}</p>
          </div>
        ))}
      </div>

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Orders</h3>
          <SearchBar
            onSearch={(v) => {
              setSearchBy(v);
              setCurrentPage(1);
            }}
          />
        </div>

        <Table
          tableData={orders?.items || []}
          tableColumns={formattedColumns}
          serverSidePagination
          onPaginationChange={({ perPage, currentPage }) => {
            setPerPage(perPage);
            setCurrentPage(currentPage);
          }}
          totalItemsCount={orders?.meta?.totalItems}
          totalPageCount={orders?.meta?.totalPages}
          loading={isLoading}
          onRowClick={(item) => {
            setSelectedOrder(item);
            setOpenView(true);
          }}
        />
      </section>

      <UpdateOrderStatusModal
        isOpen={openUpdate}
        onClose={() => {
          setOpenUpdate(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        loading={isUpdating}
        onSubmit={handleUpdate}
      />

      <ViewOrderModal
        isOpen={openView}
        onClose={() => {
          setOpenView(false);
          setSelectedOrder(null);
        }}
        orderId={selectedOrder?._id}
        onUpdate={() => {
          setOpenUpdate(true);
          setOpenView(false);
        }}
      />
    </div>
  );
};

export default Orders;
