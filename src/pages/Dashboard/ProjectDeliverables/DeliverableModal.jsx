import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "~/components/Global/Modal/Modal";
import Button from "~/components/Global/Button/Button";
import { useCreateDeliverableMutation, useUpdateDeliverableMutation } from "~/redux/api/projectDeliverablesApi";

const DeliverableModal = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature",
    status: "pending",
    repositories: [],
    estimatedTime: "",
    actualTime: "",
    linesOfCode: "",
    commits: "",
    startDate: "",
    completionDate: "",
    tags: "",
    businessValue: "",
    technicalNotes: "",
    clientFacing: "",
    priority: 3,
  });

  const [createDeliverable, { isLoading: isCreating }] = useCreateDeliverableMutation();
  const [updateDeliverable, { isLoading: isUpdating }] = useUpdateDeliverableMutation();

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        category: item.category || "feature",
        status: item.status || "pending",
        repositories: item.repositories || [],
        estimatedTime: item.estimatedTime || "",
        actualTime: item.actualTime || "",
        linesOfCode: item.linesOfCode || "",
        commits: item.commits || "",
        startDate: item.startDate ? item.startDate.split("T")[0] : "",
        completionDate: item.completionDate ? item.completionDate.split("T")[0] : "",
        tags: item.tags?.join(", ") || "",
        businessValue: item.businessValue || "",
        technicalNotes: item.technicalNotes || "",
        clientFacing: item.clientFacing || "",
        priority: item.priority || 3,
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRepositoryToggle = (repo) => {
    setFormData((prev) => ({
      ...prev,
      repositories: prev.repositories.includes(repo)
        ? prev.repositories.filter((r) => r !== repo)
        : [...prev.repositories, repo],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      estimatedTime: formData.estimatedTime ? Number(formData.estimatedTime) : undefined,
      actualTime: formData.actualTime ? Number(formData.actualTime) : undefined,
      linesOfCode: formData.linesOfCode ? Number(formData.linesOfCode) : undefined,
      commits: formData.commits ? Number(formData.commits) : undefined,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      priority: Number(formData.priority),
    };

    // Remove empty fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) {
        delete payload[key];
      }
    });

    try {
      if (item) {
        await updateDeliverable({ id: item._id, ...payload }).unwrap();
        toast.success("Deliverable updated successfully");
      } else {
        await createDeliverable(payload).unwrap();
        toast.success("Deliverable created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save deliverable");
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={item ? "Edit Deliverable" : "Add New Deliverable"} size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Automated Backup System"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Technical description of the work done"
          />
        </div>

        {/* Client Facing Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client-Facing Description</label>
          <textarea
            name="clientFacing"
            value={formData.clientFacing}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Non-technical description for clients/stakeholders"
          />
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="feature">Feature</option>
              <option value="bug_fix">Bug Fix</option>
              <option value="enhancement">Enhancement</option>
              <option value="security">Security</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Repositories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Repositories</label>
          <div className="flex flex-wrap gap-2">
            {["frontend", "backend", "admin", "mobile"].map((repo) => (
              <label key={repo} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.repositories.includes(repo)}
                  onChange={() => handleRepositoryToggle(repo)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm capitalize">{repo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time and Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
            <input
              type="number"
              name="actualTime"
              value={formData.actualTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lines of Code</label>
            <input
              type="number"
              name="linesOfCode"
              value={formData.linesOfCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commits</label>
            <input
              type="number"
              name="commits"
              value={formData.commits}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0-5)</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            min="0"
            max="5"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., automation, email, backup"
          />
        </div>

        {/* Business Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Value</label>
          <textarea
            name="businessValue"
            value={formData.businessValue}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Impact on business operations, cost savings, revenue, etc."
          />
        </div>

        {/* Technical Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technical Notes</label>
          <textarea
            name="technicalNotes"
            value={formData.technicalNotes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Technical implementation details, challenges, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outlined" label="Cancel" onClick={onClose} />
          <Button type="submit" label={item ? "Update" : "Create"} isLoading={isCreating || isUpdating} />
        </div>
      </form>
    </Modal>
  );
};

export default DeliverableModal;
