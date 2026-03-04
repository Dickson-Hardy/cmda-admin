import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCreateChapterMutation, useUpdateChapterMutation } from "~/redux/api/chaptersApi";
import { FiX } from "react-icons/fi";

const ChapterModal = ({ chapter, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Student",
    description: "",
    location: "",
    isActive: true,
  });

  const [createChapter, { isLoading: isCreating }] = useCreateChapterMutation();
  const [updateChapter, { isLoading: isUpdating }] = useUpdateChapterMutation();

  useEffect(() => {
    if (chapter) {
      setFormData({
        name: chapter.name || "",
        type: chapter.type || "Student",
        description: chapter.description || "",
        location: chapter.location || "",
        isActive: chapter.isActive !== undefined ? chapter.isActive : true,
      });
    }
  }, [chapter]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (chapter) {
        await updateChapter({ id: chapter._id, ...formData }).unwrap();
        toast.success("Chapter updated successfully");
      } else {
        await createChapter(formData).unwrap();
        toast.success("Chapter created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || `Failed to ${chapter ? "update" : "create"} chapter`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {chapter ? "Edit Chapter" : "Add New Chapter"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Chapter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Lagos University Teaching Hospital - LUTH"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={!!chapter}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="Student">Student</option>
              <option value="Doctor">Doctor</option>
              <option value="Global">Global</option>
            </select>
            {chapter && (
              <p className="text-xs text-gray-500 mt-1">Chapter type cannot be changed</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Lagos, Nigeria"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the chapter"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active Chapter
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? "Saving..." : chapter ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterModal;
