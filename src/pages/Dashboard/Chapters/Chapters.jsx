import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetAllChaptersQuery, useGetChapterStatsQuery, useDeleteChapterMutation } from "~/redux/api/chaptersApi";
import ChapterModal from "~/components/Dashboard/Chapters/ChapterModal";
import Pagination from "~/components/Global/Pagination/Pagination";
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";

const Chapters = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedType, setSelectedType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: chaptersResult,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllChaptersQuery({
    page: currentPage,
    limit: perPage,
    ...(selectedType !== "all" ? { type: selectedType } : {}),
  });
  const { data: stats } = useGetChapterStatsQuery();
  const [deleteChapter] = useDeleteChapterMutation();
  const chapters = chaptersResult?.items || [];
  const pagination = chaptersResult?.meta;
  const totalPages = pagination?.totalPages || 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async () => {
    const { id } = deleteTarget || {};
    if (!id) return;
    setDeleteTarget(null);
    try {
      await deleteChapter(id).unwrap();
      toast.success("Chapter deleted successfully");
      if (chapters.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        refetch();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete chapter");
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChapter(null);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Student":
        return "bg-onPrimaryContainer text-ink";
      case "Doctor":
        return "bg-green-100 text-green-800";
      case "Global":
        return "bg-onPrimaryContainer text-primary";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Chapters Management"
        subtitle="Manage student, doctor, and global chapters"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FiUsers className="text-3xl text-gray-400" />
            </div>
          </div>
          <div className="bg-primaryTint rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Student Chapters</p>
                <p className="text-2xl font-bold text-ink">{stats.student}</p>
              </div>
              <FiUsers className="text-3xl text-primary" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Doctor Chapters</p>
                <p className="text-2xl font-bold text-green-900">{stats.doctor}</p>
              </div>
              <FiUsers className="text-3xl text-green-400" />
            </div>
          </div>
          <div className="bg-primaryTint rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Global Chapters</p>
                <p className="text-2xl font-bold text-dark">{stats.global}</p>
              </div>
              <FiUsers className="text-3xl text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Chapters
            </button>
            <button
              onClick={() => handleTypeChange("Student")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Student" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleTypeChange("Doctor")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Doctor" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => handleTypeChange("Global")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Global" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Global
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-dark transition-colors"
          >
            <FiPlus /> Add Chapter
          </button>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading || isFetching ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chapters...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Unable to load chapters.</p>
            <button onClick={refetch} className="mt-3 text-sm font-medium text-primary hover:text-ink">
              Try again
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No chapters found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapter Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{chapter.name}</div>
                      {chapter.description && <div className="text-sm text-gray-500">{chapter.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                          chapter.type
                        )}`}
                      >
                        {chapter.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chapter.location || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chapter.memberCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          chapter.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {chapter.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(chapter)} className="text-primary hover:text-ink mr-4">
                        <FiEdit2 className="inline" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: chapter._id, name: chapter.name })}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isFetching && !isError && pagination?.totalItems > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                Rows per page
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[10, 25, 50].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={setCurrentPage}
                className="flex-1 py-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ChapterModal
          chapter={editingChapter}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            refetch();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        icon={<FiTrash2 />}
        title="Delete chapter"
        subtitle={`Are you sure you want to delete "${deleteTarget?.name || ""}"?`}
        mainAction={handleDelete}
        mainActionText="Delete"
        subAction={true}
      />
    </div>
  );
};

export default Chapters;
