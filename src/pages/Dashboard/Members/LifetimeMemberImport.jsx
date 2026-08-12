import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import Loading from "~/components/Global/Loading/Loading";
import { useConfirmLifetimeMemberImportMutation, usePreviewLifetimeMemberImportMutation } from "~/redux/api/membersApi";
import { downloadLifetimeImportTemplate, parseLifetimeMembersSheet } from "~/utilities/parseLifetimeMembersSheet";

const statusClasses = {
  matched: "bg-green-100 text-green-800",
  ambiguous: "bg-amber-100 text-amber-800",
  unmatched: "bg-gray-100 text-gray-700",
  invalid: "bg-red-100 text-red-800",
};

const LifetimeMemberImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState({});
  const [previewImport, { isLoading: isPreviewing }] = usePreviewLifetimeMemberImportMutation();
  const [confirmImport, { isLoading: isImporting }] = useConfirmLifetimeMemberImportMutation();

  const selectedRows = useMemo(
    () => preview?.rows?.filter((row) => selected[row.rowNumber]) || [],
    [preview, selected]
  );

  const handlePreview = async () => {
    if (!file) return toast.error("Choose a CSV or Excel file first");
    try {
      const rows = await parseLifetimeMembersSheet(file);
      const result = await previewImport({ fileName: file.name, rows }).unwrap();
      setPreview(result);
      setSelected(
        Object.fromEntries(
          result.rows
            .filter((row) => row.status === "matched" && !row.match.alreadyLifetime)
            .map((row) => [row.rowNumber, row.match.userId])
        )
      );
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Could not read this spreadsheet");
    }
  };

  const handleConfirm = async () => {
    if (!selectedRows.length) return toast.error("Select at least one matched member");
    const rows = selectedRows.map((row) => ({
      rowNumber: row.rowNumber,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      category: row.category,
      chapter: row.chapter,
      userId: selected[row.rowNumber],
    }));
    try {
      const result = await confirmImport({ fileName: file.name, rows }).unwrap();
      toast.success(`${result.imported} lifetime members imported; ${result.failed} failed`);
      setPreview(null);
      setSelected({});
      setFile(null);
    } catch (error) {
      toast.error(error?.data?.message || "Import failed; no unmatched rows were changed");
    }
  };

  return (
    <div className="p-6">
      <BackButton />
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Import Lifetime Members</h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Upload an Excel or CSV sheet. Nothing changes until you review the matches and confirm them. Blank phone
              and chapter fields may be filled from the sheet; existing values are preserved.
            </p>
          </div>
          <Button label="Download Template" variant="outlined" onClick={downloadLifetimeImportTemplate} />
        </div>

        <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-6">
          <label className="block text-sm font-semibold mb-2" htmlFor="lifetime-member-sheet">
            Member spreadsheet
          </label>
          <input
            id="lifetime-member-sheet"
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setPreview(null);
              setSelected({});
            }}
            className="block w-full text-sm border rounded-lg p-3"
          />
          <p className="text-xs text-gray-500 mt-2">
            Recognized columns: Full Name, Email Address, Phone Number, Category, Chapter/Region. Maximum 5,000 rows.
          </p>
          <Button
            label="Match and Preview"
            onClick={handlePreview}
            loading={isPreviewing}
            disabled={!file}
            className="mt-4"
          />
        </div>

        {isPreviewing ? <Loading /> : null}

        {preview ? (
          <div className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              {[
                ["Rows", preview.total],
                ["Matched", preview.counts.matched],
                ["Needs review", preview.counts.ambiguous],
                ["Unmatched", preview.counts.unmatched],
                ["Invalid", preview.counts.invalid],
              ].map(([label, value]) => (
                <div key={label} className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Import</th>
                    <th className="p-3 text-left">Sheet row</th>
                    <th className="p-3 text-left">Spreadsheet details</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Matched account / resolution</th>
                    <th className="p-3 text-left">Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row) => {
                    const candidates = row.status === "matched" ? [row.match] : row.candidates || [];
                    const selectedUserId = selected[row.rowNumber] || "";
                    const selectedCandidate = candidates.find((candidate) => candidate.userId === selectedUserId);
                    return (
                      <tr key={row.rowNumber} className="align-top">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedUserId)}
                            disabled={
                              !candidates.length ||
                              candidates.every((candidate) => candidate.alreadyLifetime) ||
                              row.status === "invalid"
                            }
                            onChange={(event) =>
                              setSelected((current) => ({
                                ...current,
                                [row.rowNumber]: event.target.checked ? selectedUserId || candidates[0].userId : "",
                              }))
                            }
                          />
                        </td>
                        <td className="p-3">{row.rowNumber}</td>
                        <td className="p-3 min-w-56">
                          <p className="font-semibold">{row.fullName || "No name"}</p>
                          <p>{row.email || "No email"}</p>
                          <p>{row.phone || "No phone"}</p>
                          <p>
                            {row.category || "No category"} · {row.chapter || "No chapter"}
                          </p>
                        </td>
                        <td className="p-3 min-w-40">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[row.status]}`}
                          >
                            {row.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">{row.reason}</p>
                        </td>
                        <td className="p-3 min-w-64">
                          {candidates.length ? (
                            <select
                              className="w-full border rounded p-2"
                              value={selectedUserId}
                              onChange={(event) =>
                                setSelected((current) => ({ ...current, [row.rowNumber]: event.target.value }))
                              }
                            >
                              <option value="">Do not import</option>
                              {candidates.map((candidate) => (
                                <option
                                  key={candidate.userId}
                                  value={candidate.userId}
                                  disabled={candidate.alreadyLifetime}
                                >
                                  {candidate.fullName} — {candidate.email} — {candidate.chapter || "No chapter"}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400">No candidate</span>
                          )}
                          {selectedCandidate?.alreadyLifetime ||
                          candidates.some((candidate) => candidate.alreadyLifetime) ? (
                            <p className="text-xs text-amber-700 mt-2">Already marked as lifetime</p>
                          ) : null}
                        </td>
                        <td className="p-3 min-w-48 text-xs text-gray-600">
                          {(row.proposedUpdates || []).length
                            ? row.proposedUpdates.map((change) => <p key={change}>{change}</p>)
                            : "Lifetime status only"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-5">
              <p className="text-sm text-gray-600">{selectedRows.length} member(s) selected for import</p>
              <Button
                label={`Confirm ${selectedRows.length} Lifetime Member${selectedRows.length === 1 ? "" : "s"}`}
                loading={isImporting}
                disabled={!selectedRows.length}
                onClick={handleConfirm}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LifetimeMemberImport;
