const HEADER_ALIASES = {
  fullName: ["full name", "fullname", "name", "member name"],
  email: ["email", "email address", "emailaddress", "e-mail"],
  phone: ["phone", "phone number", "phonenumber", "mobile", "mobile number", "telephone"],
  category: ["category", "lifetime category", "membership category", "membership type", "type"],
  chapter: ["chapter", "chapter name", "region", "state", "location"],
};

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const findValue = (row, aliases) => {
  const key = Object.keys(row).find((candidate) => aliases.includes(normalizeHeader(candidate)));
  return key ? String(row[key] ?? "").trim() : "";
};

export const parseLifetimeMembersSheet = async (file) => {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw new Error("The workbook has no worksheet");

  const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false });
  if (!rawRows.length) throw new Error("The worksheet has no member rows");

  const rows = rawRows
    .map((row, index) => ({
      rowNumber: index + 2,
      fullName: findValue(row, HEADER_ALIASES.fullName),
      email: findValue(row, HEADER_ALIASES.email) || undefined,
      phone: findValue(row, HEADER_ALIASES.phone) || undefined,
      category: findValue(row, HEADER_ALIASES.category) || undefined,
      chapter: findValue(row, HEADER_ALIASES.chapter) || undefined,
    }))
    .filter((row) => row.fullName || row.email || row.phone || row.category || row.chapter);

  if (!rows.length) throw new Error("No usable member rows were found");
  return rows;
};

export const downloadLifetimeImportTemplate = async () => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet([
    {
      "Full Name": "Example Nigerian Member",
      "Email Address": "nigerian.member@example.com",
      "Phone Number": "+2348000000000",
      Category: "Lifetime",
      Chapter: "Lagos",
    },
    {
      "Full Name": "Example Global Member",
      "Email Address": "global.member@example.com",
      "Phone Number": "",
      Category: "Gold",
      Chapter: "Americas",
    },
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lifetime Members");
  XLSX.writeFile(workbook, "CMDA_Lifetime_Member_Import_Template.xlsx");
};
