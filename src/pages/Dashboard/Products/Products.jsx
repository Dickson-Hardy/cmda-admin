import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
// import CreateProductModal from "~/components/Dashboard/Products/CreateProductModal";
import ViewProductModal from "~/components/Dashboard/Products/ViewProductModal";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import {
  useDeleteProductBySlugMutation,
  useGetAllProductsQuery,
  useGetProductStatsQuery,
} from "~/redux/api/productsApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const Products = () => {
  const [selectedProd, setSelectedProd] = useState(null);
  // const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState("");
  const { data: products, isLoading } = useGetAllProductsQuery({ page: currentPage, limit: perPage, searchBy });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductBySlugMutation();
  const { data: stats } = useGetProductStatsQuery();
  const navigate = useNavigate();

  const productStats = useMemo(
    () => ({
      total: stats?.totalProducts,
      "Journals & Magazines": stats?.totalJournals,
      "Customized Wears": stats?.totalWears,
      publications: stats?.totalPublications,
      others: stats?.totalOthers,
    }),
    [stats]
  );

  const COLUMNS = [
    { header: "Product Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Price NGN", accessor: "price" },
    { header: "Price USD", accessor: "priceUSD" },
    { header: "Brand", accessor: "brand" },
    { header: "Qty", accessor: "stock" },
    { header: "Date Added", accessor: "createdAt" },
    { header: "", accessor: "action" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "name" ? (
        <div className="inline-flex gap-2 items-center font-medium">
          <img src={item.featuredImageUrl} className="size-14 rounded-lg bg-onPrimaryContainer" />
          {item.name}
        </div>
      ) : col.accessor === "createdAt" ? (
        formatDate(value).date
      ) : col.accessor === "price" ? (
        formatCurrency(value)
      ) : col.accessor === "priceUSD" ? (
        formatCurrency(value, "USD")
      ) : col.accessor === "action" ? (
        <div className="inline-flex items-center gap-3 text-gray-dark">
          <button type="button" onClick={() => handleAction(item, "view")} className="text-sm">
            {icons.eye}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/create?edit=${item.slug}`, { state: { product: item } })}
            className="text-sm"
          >
            {icons.pencil}
          </button>
          <button type="button" onClick={() => handleAction(item, "delete")} className="text-lg">
            {icons.delete}
          </button>
        </div>
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const handleAction = (item, action) => {
    setSelectedProd(item);
    if (action === "view") setOpenView(true);
    if (action === "delete") setOpenDelete(true);
  };

  const handleDelete = () => {
    deleteProduct(selectedProd?.slug)
      .unwrap()
      .then(() => {
        toast.success("Product DELETED successfully");
        setOpenDelete(false);
      });
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage all products in store"
        action={() => navigate(`/products/create`)}
        actionLabel="Add Product"
      />

      <div className="grid  sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {Object.entries(productStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{value || 0}</p>
          </div>
        ))}
      </div>

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Products</h3>
          <SearchBar
            onSearch={(v) => {
              setSearchBy(v);
              setCurrentPage(1);
            }}
          />
        </div>

        <Table
          tableData={products?.items || []}
          tableColumns={formattedColumns}
          serverSidePagination
          onPaginationChange={({ perPage, currentPage }) => {
            setPerPage(perPage);
            setCurrentPage(currentPage);
          }}
          totalItemsCount={products?.meta?.totalItems}
          totalPageCount={products?.meta?.totalPages}
          loading={isLoading}
        />
      </section>

      {/* <CreateProductModal
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setSelectedProd(null);
        }}
        product={selectedProd}
        loading={isCreating || isUpdating}
        onSubmit={selectedProd ? handleUpdate : handleCreate}
      /> */}

      <ViewProductModal
        isOpen={openView}
        onClose={() => {
          setOpenView(false);
          setSelectedProd(null);
        }}
        product={selectedProd}
      />

      {/*  */}
      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        icon={icons.image}
        title="Delete Product"
        subtitle={`Are you sure you want to delete this product - ${selectedProd?.name} `}
      />
    </div>
  );
};

export default Products;
