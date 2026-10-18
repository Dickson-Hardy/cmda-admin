import { useEffect, useState } from "react";
import Button from "~/components/Global/Button/Button";
import {
  useGetZelleAdminSettingsQuery,
  useSaveZelleSettingsMutation,
  useGetZelleReviewQueueQuery,
  useGetZelleProofMutation,
  useReviewZelleMutation,
} from "~/redux/api/zelleApi";

export default function ZellePayments() {
  const { data: settings, isError: settingsError } = useGetZelleAdminSettingsQuery();
  const [form, setForm] = useState({ enabled: false, accountName: "", recipient: "", instructions: "" });
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useGetZelleReviewQueueQuery(page);
  const [save, { isLoading: saving }] = useSaveZelleSettingsMutation();
  const [getProof] = useGetZelleProofMutation();
  const [review, { isLoading: reviewing }] = useReviewZelleMutation();
  const [selected, setSelected] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (settings)
      setForm({
        enabled: settings.enabled,
        accountName: settings.accountName,
        recipient: settings.recipient,
        instructions: settings.instructions,
      });
  }, [settings]);
  const reportError = (e) => setFeedback(e?.data?.message || "Request failed. Please try again.");
  const decide = async (decision) => {
    if (note.trim().length < 3) {
      setFeedback("Add a review note of at least three characters.");
      return;
    }
    try {
      await review({ id: selected._id, decision, note: note.trim() }).unwrap();
      setSelected(null);
      setProofUrl("");
      setNote("");
      setFeedback(
        decision === "approve"
          ? "Payment confirmed and member balance updated."
          : "Payment rejected. The member can see your review note."
      );
      await refetch();
    } catch (e) {
      reportError(e);
    }
  };
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Zelle payments</h1>
      <p>Manage USD receiving details and verify transfers before crediting a member.</p>
      <form
        className="bg-white p-4 sm:p-6 border rounded-lg space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await save(form).unwrap();
            setFeedback("Zelle details saved. New payment intents will use these details.");
          } catch (error) {
            reportError(error);
          }
        }}
      >
        <h2 className="font-semibold">Receiving account</h2>
        {settingsError && <p className="text-red-700">Unable to load settings. Refresh before editing.</p>}
        <label className="flex gap-3 items-center">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Enable Zelle for members
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["accountName", "Account name", 120],
            ["recipient", "Zelle email or US phone number", 120],
          ].map(([key, label, max]) => (
            <label className="text-sm" key={key}>
              {label}
              <input
                required={form.enabled}
                maxLength={max}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="block w-full mt-1 border rounded p-3"
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          Transfer instructions
          <textarea
            maxLength={1000}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="block w-full mt-1 border rounded p-3"
          />
        </label>
        <Button type="submit" label="Save Zelle details" loading={saving} disabled={!settings || settingsError} />
      </form>
      {feedback && (
        <p role="status" className="p-3 bg-gray-100 rounded break-words">
          {feedback}
        </p>
      )}
      {selected && (
        <section className="border rounded bg-white p-4 space-y-3">
          <h2 className="font-semibold">Review {selected.intentCode}</h2>
          <p>
            {selected.user?.fullName} · USD {Number(selected.amount).toFixed(2)} · {selected.transferReference}
          </p>
          <p className="text-sm">
            Verify the amount and transaction reference against the receiving Zelle account before approving. A
            screenshot alone does not confirm receipt.
          </p>
          {proofUrl ? (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="text-primary underline">
              Open receipt (link expires in 5 minutes)
            </a>
          ) : (
            <p>Loading receipt...</p>
          )}
          <label className="block text-sm">
            Review note (visible to the member)
            <textarea
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full border rounded p-3 mt-1"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              label="Confirm received payment"
              disabled={!proofUrl}
              loading={reviewing}
              onClick={() => decide("approve")}
            />
            <Button
              label="Reject proof"
              color="error"
              disabled={!proofUrl}
              loading={reviewing}
              onClick={() => decide("reject")}
            />
            <Button
              label="Close"
              variant="outlined"
              onClick={() => {
                setSelected(null);
                setProofUrl("");
              }}
            />
          </div>
        </section>
      )}
      <section className="bg-white border rounded p-4 space-y-4">
        <h2 className="font-semibold">Transfer review queue</h2>
        {isLoading ? (
          <p>Loading transfers...</p>
        ) : isError ? (
          <p role="alert">Unable to load transfers.</p>
        ) : (
          <>
            {!data?.items?.length && <p>No Zelle transfers yet.</p>}
            {data?.items?.map((item) => (
              <div key={item._id} className="border-t pt-3 flex flex-col sm:flex-row gap-3 sm:justify-between">
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="font-semibold">
                    {item.user?.fullName || item.email} · USD {Number(item.amount).toFixed(2)}
                  </p>
                  <p className="break-all">
                    {item.intentCode} · {item.context}
                  </p>
                  <p>
                    {item.status.replaceAll("_", " ")}
                    {item.contextData?.targetYear ? ` · ${item.contextData.targetYear}` : ""}
                  </p>
                  {item.reviewNote && <p>{item.reviewNote}</p>}
                </div>
                {["AWAITING_REVIEW", "REVIEWING"].includes(item.status) && (
                  <Button
                    small
                    label="Review receipt"
                    onClick={async () => {
                      setSelected(item);
                      setProofUrl("");
                      setNote("");
                      try {
                        setProofUrl((await getProof(item._id).unwrap()).url);
                      } catch (e) {
                        reportError(e);
                      }
                    }}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <Button small label="Previous" disabled={page === 1} onClick={() => setPage(page - 1)} />
              <span>Page {page}</span>
              <Button
                small
                label="Next"
                disabled={page >= (data?.meta?.totalPages || 1)}
                onClick={() => setPage(page + 1)}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
