import { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetAllChaptersQuery,
  useGetChapterStatsQuery,
  useDeleteChapterMutation,
} from "~/redux/api/chaptersApi";
import ChapterModal from "~/components/Dashboard/Chapters/ChapterModal";
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";

const Chapters = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  const { data: chapters = [], isLoading, refetch } = useGetAllChaptersQuery(
    selectedType !== "all" ? { type: selectedType } : {}
  );
  const { data: stats } = useGetChapterStatsQuery();
  const [deleteChapter] = useDeleteChapterMutation();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteChapter(id).unwrap();
      toast.success("Chapter deleted successfully");
      refetch();
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

  const getTypeColor = (type) => {
    switch (type) {
      case "Student":
        return "bg-blue-100 text-blue-800";
      case "Doctor":
        return "bg-green-100 text-green-800";
      case "Global":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chapters Management</h1>
        <p className="text-gray-600 mt-1">Manage student, doctor, and global chapters</p>
      </div>

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
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Student Chapters</p>
                <p className="text-2xl font-bold text-blue-900">{stats.student}</p>
              </div>
              <FiUsers className="text-3xl text-blue-400" />
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
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Global Chapters</p>
                <p className="text-2xl font-bold text-purple-900">{stats.global}</p>
              </div>
              <FiUsers className="text-3xl text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Chapters
            </button>
            <button
              onClick={() => setSelectedType("Student")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Student"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setSelectedType("Doctor")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Doctor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => setSelectedType("Global")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === "Global"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Global
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Add Chapter
          </button>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chapters...</p>
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
                      {chapter.description && (
                        <div className="text-sm text-gray-500">{chapter.description}</div>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chapter.location || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chapter.memberCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          chapter.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {chapter.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(chapter)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FiEdit2 className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(chapter._id, chapter.name)}
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
    </div>
  );
};

export default Chapters;
