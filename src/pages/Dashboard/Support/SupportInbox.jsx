import { useEffect, useRef, useState } from "react";
import {
  useGetSupportTicketsQuery,
  useGetSupportTicketQuery,
  useUpdateSupportTicketMutation,
  useReplySupportTicketMutation,
  useGetSupportAttachmentMutation,
} from "~/redux/api/supportApi";
import { getApiErrorMessage } from "~/utilities/getApiErrorMessage";

const statuses = { open: "Open", in_progress: "In progress", awaiting_member: "Awaiting member", resolved: "Resolved" };
const input = "border border-gray-300 rounded-lg px-3 py-2 min-w-0 bg-white w-full";
const button = "rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-wait";

function Conversation({ id, onClose }) {
  const panel = useRef(null);
  const { currentData: ticket, isFetching, error, refetch } = useGetSupportTicketQuery(id);
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    if (window.innerWidth < 1280) panel.current?.scrollIntoView({ block: "start" });
  }, [id, ticket?._id]);
  const [update, { isLoading: updating }] = useUpdateSupportTicketMutation();
  const [send, { isLoading: sending }] = useReplySupportTicketMutation();
  const [attachment, { isLoading: loadingAttachment }] = useGetSupportAttachmentMutation();
  const [status, setStatus] = useState("");
  const [assignment, setAssignment] = useState("keep");
  const [reply, setReply] = useState("");
  const replyId = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const busy = updating || sending;
  const fail = (e) =>
    setFeedback({
      error: true,
      message: getApiErrorMessage(e, "Changes could not be saved. Your text has been kept. Please try again."),
    });
  return (
    <section
      ref={panel}
      tabIndex={-1}
      className="bg-white border rounded-xl p-4 sm:p-6 min-w-0 space-y-5 scroll-mt-24"
      aria-label="Selected conversation"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Conversation</h2>
        <button className={button} onClick={onClose}>
          Close
        </button>
      </div>
      {feedback ? (
        <p
          role={feedback.error ? "alert" : "status"}
          className={`p-3 rounded-lg ${feedback.error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
        >
          {feedback.message}
        </p>
      ) : null}
      {error ? (
        <div role="alert">
          The conversation could not be loaded.{" "}
          <button onClick={refetch} className={button}>
            Try again
          </button>
        </div>
      ) : !ticket ? (
        <p role="status">Loading conversation…</p>
      ) : (
        <>
          <div>
            <p className="text-xs text-gray-500">
              {ticket.reference} · {ticket.source} · {ticket.kind}
            </p>
            <h3 className="text-xl font-bold break-words mt-2">{ticket.subject}</h3>
            <p className="break-words mt-2">
              {ticket.name} · {ticket.email}
            </p>
            <p className="text-sm text-gray-600">
              Category: {ticket.category} · Assigned to: {ticket.assignedTo?.fullName || "Unassigned"}
            </p>
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setFeedback(null);
              try {
                await update({ id, status: status || ticket.status, assignment, version: ticket.revision }).unwrap();
                setStatus("");
                setAssignment("keep");
                setFeedback({ message: "Status and assignment saved." });
              } catch (err) {
                fail(err);
              }
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm font-semibold">
                Status
                <select
                  aria-label="Conversation status"
                  className={input}
                  value={status || ticket.status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.entries(statuses).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Assignment
                <select
                  aria-label="Assignment"
                  className={input}
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                >
                  <option value="keep">Keep current assignment</option>
                  <option value="me">Assign to me</option>
                  <option value="unassigned">Unassign</option>
                </select>
              </label>
            </div>
            <button className={`${button} bg-primary text-white`} disabled={busy || isFetching}>
              {updating ? "Saving…" : "Save changes"}
            </button>
          </form>
          {ticket.hasAttachment ? (
            <div>
              <button
                className={button}
                disabled={loadingAttachment}
                onClick={async () => {
                  try {
                    setImageUrl((await attachment(id).unwrap()).url);
                  } catch (err) {
                    fail(err);
                  }
                }}
              >
                {loadingAttachment ? "Loading screenshot…" : "View screenshot"}
              </button>
              {imageUrl ? (
                <div className="mt-3">
                  <a href={imageUrl} target="_blank" rel="noreferrer" className="underline text-primary">
                    Open screenshot (link expires in 5 minutes)
                  </a>
                  <img
                    src={imageUrl}
                    alt="Screenshot attached to this submission"
                    className="max-h-96 object-contain mt-2 rounded-lg border"
                    onError={() => {
                      setImageUrl("");
                      setFeedback({
                        error: true,
                        message: "The screenshot link may have expired. Select View screenshot to refresh it.",
                      });
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-3" aria-label="Message history">
            {ticket.messages.map((message) => (
              <article
                key={message.messageId}
                className={`p-4 rounded-xl ${message.author === "team" ? "bg-purple-50" : "bg-gray-50"}`}
              >
                <div className="flex flex-wrap gap-2 justify-between text-xs text-gray-600">
                  <strong>{message.author === "team" ? "CMDA team" : ticket.name}</strong>
                  <time>{new Date(message.createdAt).toLocaleString()}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words">{message.message}</p>
              </article>
            ))}
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setFeedback(null);
              try {
                replyId.current ||= crypto.randomUUID();
                await send({ id, message: reply, messageId: replyId.current, version: ticket.revision }).unwrap();
                setReply("");
                replyId.current = null;
                setFeedback({ message: "Reply saved. The conversation is now awaiting the member’s response." });
              } catch (err) {
                fail(err);
              }
            }}
          >
            <label className="block text-sm font-semibold">
              Reply to member
              <textarea
                className={`${input} mt-2`}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  replyId.current = null;
                }}
                rows={4}
                required
                minLength={2}
                maxLength={5000}
              />
            </label>
            <p className="text-xs text-gray-500">
              This reply is visible to the sender. Replies notify the sender by email when delivery is available. Never
              request passwords or full payment card details.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button className={`${button} bg-primary text-white`} disabled={busy || isFetching || !reply.trim()}>
                {sending ? "Sending…" : "Send reply"}
              </button>
              <button type="button" className={button} disabled={busy} onClick={refetch}>
                Refresh
              </button>
            </div>
          </form>
          <details className="text-xs text-gray-500">
            <summary>Admin activity</summary>
            <ul className="space-y-2 mt-2">
              {ticket.history?.map((entry, i) => (
                <li key={i}>
                  {new Date(entry.createdAt).toLocaleString()} · {entry.action}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}

export default function SupportInbox() {
  const [filters, setFilters] = useState({ page: 1, status: "", kind: "", source: "", search: "" });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
  const { currentData: data, isFetching, error, refetch } = useGetSupportTicketsQuery(query);
  const filter = (e) => setFilters((previous) => ({ ...previous, [e.target.name]: e.target.value, page: 1 }));
  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <p className="text-sm text-primary font-semibold">Member experience</p>
        <h1 className="text-2xl font-bold mt-1">Complaints & feedback</h1>
        <p className="text-gray-600 mt-2">
          One inbox for cmdanigeria.net and cmdanigeria.org. Review, assign and respond to submissions.
        </p>
      </header>
      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm">
            Status
            <select name="status" value={filters.status} onChange={filter} className={input}>
              <option value="">All statuses</option>
              {Object.entries(statuses).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Type
            <select name="kind" value={filters.kind} onChange={filter} className={input}>
              <option value="">Complaints & feedback</option>
              <option value="complaint">Complaints</option>
              <option value="feedback">Feedback</option>
            </select>
          </label>
          <label className="text-sm">
            Website
            <select name="source" value={filters.source} onChange={filter} className={input}>
              <option value="">Both websites</option>
              <option>cmdanigeria.net</option>
              <option>cmdanigeria.org</option>
            </select>
          </label>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters((previous) => ({ ...previous, page: 1, search: search.trim() }));
          }}
        >
          <input
            aria-label="Search submissions"
            placeholder="Search reference, name, email or subject"
            className={input}
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={button}>Search</button>
        </form>
      </div>
      <div className={`grid gap-6 ${selected ? "xl:grid-cols-2" : ""}`}>
        <section className="min-w-0" aria-label="Submissions">
          <div className="flex gap-3 items-center justify-between mb-3">
            <p className="text-sm text-gray-600">{data ? `${data.meta.totalItems} submissions` : "Submissions"}</p>
            <button className={button} onClick={refetch} disabled={isFetching}>
              Refresh inbox
            </button>
          </div>
          {error ? (
            <p role="alert" className="p-4 rounded-xl bg-red-50">
              The inbox could not be loaded. Use Refresh inbox to try again.
            </p>
          ) : isFetching ? (
            <p role="status" className="p-4">
              Loading submissions…
            </p>
          ) : data?.items?.length ? (
            <div className="space-y-3">
              {data.items.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  aria-pressed={selected === ticket._id}
                  onClick={() => setSelected(ticket._id)}
                  className={`text-left w-full bg-white rounded-xl p-4 border hover:border-primary ${selected === ticket._id ? "border-primary ring-1 ring-primary" : "border-gray-200"}`}
                >
                  <div className="flex gap-3 justify-between flex-wrap text-xs text-gray-500">
                    <span>
                      {ticket.reference} · {ticket.kind}
                    </span>
                    <span>{statuses[ticket.status]}</span>
                  </div>
                  <h2 className="font-bold break-words my-2">{ticket.subject}</h2>
                  <p className="text-sm break-words">
                    {ticket.name} · {ticket.source}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(ticket.createdAt).toLocaleString()} · {ticket.assignedTo?.fullName || "Unassigned"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="bg-white border rounded-xl p-8 text-center text-gray-600">
              No submissions match these filters.
            </p>
          )}
          <nav aria-label="Inbox pagination" className="flex items-center justify-between gap-3 mt-5">
            <button
              className={button}
              disabled={isFetching || filters.page <= 1}
              onClick={() => setFilters((previous) => ({ ...previous, page: previous.page - 1 }))}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {filters.page} of {Math.max(1, data?.meta.totalPages || 1)}
            </span>
            <button
              className={button}
              disabled={isFetching || !data || filters.page >= data.meta.totalPages}
              onClick={() => setFilters((previous) => ({ ...previous, page: previous.page + 1 }))}
            >
              Next
            </button>
          </nav>
        </section>
        {selected ? <Conversation key={selected} id={selected} onClose={() => setSelected(null)} /> : null}
      </div>
    </div>
  );
}
