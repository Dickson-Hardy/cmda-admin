import { useState } from "react";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import {
  useGetDeliverablesQuery,
  useGetDeliverableStatsQuery,
  useDeleteDeliverableMutation,
  useExportDeliverablesPDFMutation,
  useExportDeliverablesImageMutation,
} from "~/redux/api/projectDeliverablesApi";
import { classNames } from "~/utilities/classNames";
import DeliverableModal from "./DeliverableModal";
import formatDate from "~/utilities/fomartDate";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const CATEGORY_COLORS = {
  feature: "bg-purple-100 text-purple-800",
  bug_fix: "bg-red-100 text-red-800",
  enhancement: "bg-indigo-100 text-indigo-800",
  security: "bg-orange-100 text-orange-800",
  infrastructure: "bg-cyan-100 text-cyan-800",
  documentation: "bg-gray-100 text-gray-800",
};

const ProjectDeliverables = () => {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    repository: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: deliverables = [], isLoading } = useGetDeliverablesQuery(filters);
  const { data: stats = {} } = useGetDeliverableStatsQuery();
  const [deleteDeliverable] = useDeleteDeliverableMutation();
  const [exportPDF, { isLoading: isExportingPDF }] = useExportDeliverablesPDFMutation();
  const [exportImage, { isLoading: isExportingImage }] = useExportDeliverablesImageMutation();

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDeliverable(id).unwrap();
      toast.success("Deliverable deleted successfully");
    } catch (error) {
      toast.error("Failed to delete deliverable");
    }
  };

  const handleExport = async (type) => {
    try {
      if (type === "PDF") {
        const result = await exportPDF().unwrap();
        const blob = new Blob([result], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CMDA-Deliverables-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF downloaded successfully");
      } else if (type === "Image") {
        const result = await exportImage().unwrap();
        const blob = new Blob([result], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CMDA-Deliverables-${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export downloaded successfully");
      }
    } catch (error) {
      toast.error(`Failed to export ${type}`);
      console.error(error);
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCategory = (category) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div>
      <PageHeader title="Project Deliverables" subtitle="Track development work, features, and time estimates" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="text-3xl text-blue-600">{icons.list}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
            </div>
            <div className="text-3xl text-green-600">{icons.check}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</p>
            </div>
            <div className="text-3xl text-blue-600">{icons.refresh}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalHoursActual?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl text-purple-600">{icons.time}</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="feature">Feature</option>
            <option value="bug_fix">Bug Fix</option>
            <option value="enhancement">Enhancement</option>
            <option value="security">Security</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="documentation">Documentation</option>
          </select>

          <select
            value={filters.repository}
            onChange={(e) => setFilters({ ...filters, repository: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Repositories</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="admin">Admin</option>
            <option value="mobile">Mobile</option>
          </select>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outlined"
              label="Export PDF"
              icon={icons.pdf}
              onClick={() => handleExport("PDF")}
              isLoading={isExportingPDF}
            />
            <Button
              variant="outlined"
              label="Export Image"
              icon={icons.imageIcon}
              onClick={() => handleExport("Image")}
              isLoading={isExportingImage}
            />
            <Button
              label="Add Deliverable"
              icon={icons.add}
              onClick={() => {
                setSelectedItem(null);
                setShowModal(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-4xl text-gray-400 mb-2">{icons.loading}</div>
            <p>Loading deliverables...</p>
          </div>
        ) : deliverables.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No deliverables found. Add your first deliverable to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repositories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliverables.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={classNames(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-800"
                        )}
                      >
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={classNames(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          STATUS_COLORS[item.status] || "bg-gray-100 text-gray-800"
                        )}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.repositories?.map((repo) => (
                          <span key={repo} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {repo}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.actualTime || item.estimatedTime || "-"}h</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.completionDate ? formatDate(item.completionDate).date : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary-dark mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">
                        Delete
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
      {showModal && (
        <DeliverableModal
          item={selectedItem}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDeliverables;
