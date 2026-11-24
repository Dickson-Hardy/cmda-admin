import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import { useDeleteFaithEntryMutation, useGetAllFaithEntriesQuery } from "~/redux/api/faithEntryApi";
import { classNames } from "~/utilities/classNames";
import formatDate from "~/utilities/fomartDate";

const DashboardFaithEntryPage = () => {
  const [faithEntries, setFaithEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const { data: faithEntrys, isLoading } = useGetAllFaithEntriesQuery({ page, limit: 10, searchBy });

  useEffect(() => {
    if (faithEntrys) {
      setFaithEntries((prevVols) => {
        const combinedVols = [...prevVols, ...faithEntrys.items];
        const uniqueVols = Array.from(new Set(combinedVols.map((vol) => vol._id))).map((_id) =>
          combinedVols.find((vol) => vol._id === _id)
        );
        return uniqueVols;
      });

      setTotalPages(faithEntrys.meta?.totalPages);
    }
  }, [faithEntrys]);

  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteFaithEntry, { isLoading: isDeleting }] = useDeleteFaithEntryMutation();

  const handleDelete = () => {
    deleteFaithEntry(selected?._id)
      .unwrap()
      .then(() => {
        setFaithEntries([]);
        toast.success(selected?.category + " DELETED successfully");
        setOpenDelete(false);
      });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Faith Entries</h2>
        <div className="flex gap-2 items-center">
          <SearchBar
            onSearch={(v) => {
              setFaithEntries([]);
              setSearchBy(v);
            }}
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mt-6">
        {faithEntries?.map((item, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between gap-4">
              <span
                className={classNames(
                  `px-3 py-1.5 text-xs font-semibold rounded-3xl`,
                  item.category === "Testimony"
                    ? "bg-secondary/20 text-secondary"
                    : item.category === "Comment"
                      ? "bg-primary/20 text-primary"
                      : "bg-tertiary/20 text-tertiary"
                )}
              >
                {item?.category}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelected(item);
                  setOpenDelete(true);
                }}
                className="text-lg"
              >
                {icons.delete}
              </button>
            </div>
            <p className="my-4 text-sm font-medium">{item.content}</p>
            <p className="text-gray-600 text-xs">
              Posted by:{" "}
              <span className="text-ink font-medium">
                {item.user?.fullName || "N/A"} {item.isAnonymous ? "(Anonymous)" : null}
              </span>
            </p>
            <p className="text-gray-600 text-xs my-2">
              Poster ID: <span className="text-ink font-medium">{item.user?.membershipId || "N/A"}</span>
            </p>
            <p className="text-gray-600 text-xs">
              Date: <span className="text-ink font-medium">{formatDate(item.createdAt).dateTime}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-center p-2 mt-6">
        <Button
          large
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          className={"md:w-1/3 w-full"}
          loading={isLoading}
          onClick={() => setPage((prev) => prev + 1)}
        />
      </div>

      {/*  */}

      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        icon={icons.delete}
        title={"Delete " + selected?.category}
        subtitle={"Are you sure you want to delete this " + selected?.category?.toLowerCase() + "?"}
        subAction
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
      />
    </div>
  );
};

export default DashboardFaithEntryPage;
