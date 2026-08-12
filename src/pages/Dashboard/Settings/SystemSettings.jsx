import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import Table from "~/components/Global/Table/Table";
import icons from "~/assets/js/icons";
import { useCreateBackupMutation, useListBackupsQuery, useDeleteBackupMutation, useLazyDownloadBackupQuery } from "~/redux/api/backupApi";
import formatDate from "~/utilities/fomartDate";

const SystemSettings = () => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const { data: backupsData, isLoading: isLoadingBackups, refetch } = useListBackupsQuery();
  const [deleteBackup] = useDeleteBackupMutation();
  const [getDownloadUrl] = useLazyDownloadBackupQuery();
  const [deletingBackup, setDeletingBackup] = useState(null);
  const [downloadingBackup, setDownloadingBackup] = useState(null);

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup().unwrap();
      toast.success("Database backup created successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create backup. Please try again.");
    }
  };

  const handleDownloadBackup = async (item) => {
    try {
      setDownloadingBackup(item.filename);
      
      const blob = await getDownloadUrl(item.filename).unwrap();
      
      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.filename}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download completed");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error?.message || "Failed to download backup");
    } finally {
      setDownloadingBackup(null);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }

    try {
      setDeletingBackup(filename);
      await deleteBackup(filename).unwrap();
      toast.success("Backup deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete backup");
    } finally {
      setDeletingBackup(null);
    }
  };

  const COLUMNS = [
    { header: "Backup Name", accessor: "filename" },
    { header: "Date Created", accessor: "date" },
    { header: "Size", accessor: "size" },
    { header: "Actions", accessor: "actions" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];

      if (col.accessor === "date") {
        return formatDate(value).dateTime;
      }

      if (col.accessor === "actions") {
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadBackup(item)}
              disabled={downloadingBackup === item.filename}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50 flex items-center gap-1"
            >
              {downloadingBackup === item.filename ? (
                "Downloading..."
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
            <button
              onClick={() => handleDeleteBackup(item.filename)}
              disabled={deletingBackup === item.filename}
              className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
            >
              {deletingBackup === item.filename ? "Deleting..." : "Delete"}
            </button>
          </div>
        );
      }

      return value || "--";
    },
    enableSorting: col.accessor !== "actions",
  }));

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Manage system backups and configurations" />

      {/* Backup Section */}
      <section className="bg-white shadow rounded-xl p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Database Backups</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create manual backups or view automatic biweekly backups. Backups are automatically created every 2 weeks.
            </p>
          </div>
          <Button label="Create Backup" loading={isCreating} onClick={handleCreateBackup} icon={icons.database} />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Automatic Backup Schedule</h4>
              <p className="text-blue-800 text-sm">
                Backups are automatically created every 2 weeks on Sunday at 2:00 AM. The system keeps the last 10
                backups and automatically removes older ones.
              </p>
            </div>
          </div>
        </div>

        {isLoadingBackups ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading backups...</p>
          </div>
        ) : (
          <Table
            tableData={backupsData?.data || []}
            tableColumns={formattedColumns}
            loading={isLoadingBackups}
            emptyMessage="No backups available"
          />
        )}

        {backupsData?.count !== undefined && (
          <div className="mt-4 text-sm text-gray-600">Total backups: {backupsData.count} / 10 maximum</div>
        )}
      </section>

      {/* System Information */}
      <section className="bg-white shadow rounded-xl p-6 mt-8">
        <h3 className="font-bold text-lg mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Database Type</p>
            <p className="font-semibold">MongoDB</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Backup Location</p>
            <p className="font-semibold">Server: /backups</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Backup Schedule</p>
            <p className="font-semibold">Biweekly (Every 2 weeks)</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Retention Policy</p>
            <p className="font-semibold">Last 10 backups</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SystemSettings;
