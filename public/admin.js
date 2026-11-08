/* Northlight Studio — admin dashboard.
   The token lives in sessionStorage only: it disappears when the tab closes. */

const TOKEN_KEY = "northlight.admin.token";
const $ = (selector) => document.querySelector(selector);

const form = $("[data-token-form]");
const tokenInput = $("#token");
const signOutButton = $("[data-sign-out]");
const toolbar = $("[data-toolbar]");
const statusNode = $("[data-status]");
const errorNode = $("[data-error]");
const refreshButton = $("[data-refresh]");
const exportButton = $("[data-export]");
const tableWrap = $("[data-table-wrap]");
const rowsBody = $("[data-rows]");
const emptyNode = $("[data-empty]");

let records = [];

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

function setStatus(message, isError = false) {
  if (statusNode) {
    statusNode.textContent = isError ? "" : message;
    statusNode.classList.remove("is-error");
  }
  if (errorNode) {
    errorNode.textContent = isError ? message : "";
    errorNode.classList.toggle("is-error", isError);
  }
}

function setUnlocked(unlocked) {
  if (toolbar) toolbar.hidden = !unlocked;
  if (signOutButton) signOutButton.hidden = !unlocked;
  if (form) form.hidden = unlocked;
  if (!unlocked) {
    if (tableWrap) tableWrap.hidden = true;
    if (emptyNode) emptyNode.hidden = true;
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cell(text, className = "") {
  const td = document.createElement("td");
  if (className) td.className = className;
  td.textContent = text ?? "";
  return td;
}

function emailCell(email) {
  const td = document.createElement("td");
  if (!email) return td;
  const link = document.createElement("a");
  link.href = `mailto:${email}`;
  link.textContent = email;
  td.append(link);
  return td;
}

function render() {
  if (!rowsBody) return;
  rowsBody.replaceChildren();

  const hasRows = records.length > 0;
  if (tableWrap) tableWrap.hidden = !hasRows;
  if (emptyNode) emptyNode.hidden = hasRows;

  for (const record of records) {
    const tr = document.createElement("tr");
    tr.append(
      cell(formatDate(record.receivedAt), "nowrap"),
      cell(record.name),
      emailCell(record.email),
      cell(record.phone ?? ""),
      cell(record.shootType ?? ""),
      cell(record.eventDate ?? "", "nowrap"),
      cell(record.budget ?? ""),
      cell(record.message ?? "", "message"),
    );
    rowsBody.append(tr);
  }
}

async function load() {
  const token = getToken();
  if (!token) {
    setUnlocked(false);
    return;
  }

  setStatus("Loading…");

  try {
    const response = await fetch("/api/admin/enquiries?limit=500", {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });

    if (response.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      setUnlocked(false);
      setStatus("That token was rejected.", true);
      return;
    }

    if (response.status === 503) {
      setUnlocked(false);
      setStatus("The server has no ADMIN_TOKEN set, so the admin area is off.", true);
      return;
    }

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    records = Array.isArray(data.enquiries) ? data.enquiries : [];

    setUnlocked(true);
    render();
    setStatus(`${records.length} enquir${records.length === 1 ? "y" : "ies"}`);
  } catch (error) {
    console.error(error);
    setStatus("Could not load enquiries. Check the server is running.", true);
  }
}

function toCsv() {
  const columns = ["receivedAt", "name", "email", "phone", "shootType", "eventDate", "budget", "message"];
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = [columns.join(",")];
  for (const record of records) {
    lines.push(columns.map((column) => escape(record[column])).join(","));
  }
  return lines.join("\r\n");
}

function downloadCsv() {
  if (records.length === 0) {
    setStatus("Nothing to export yet.", true);
    return;
  }

  const blob = new Blob([toCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `northlight-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = tokenInput?.value.trim() ?? "";
  if (!token) return;
  sessionStorage.setItem(TOKEN_KEY, token);
  load();
});

signOutButton?.addEventListener("click", () => {
  sessionStorage.removeItem(TOKEN_KEY);
  records = [];
  if (tokenInput) tokenInput.value = "";
  if (rowsBody) rowsBody.replaceChildren();
  setUnlocked(false);
  setStatus("");
});

refreshButton?.addEventListener("click", () => {
  load();
});

exportButton?.addEventListener("click", () => {
  downloadCsv();
});

setUnlocked(Boolean(getToken()));
load();
