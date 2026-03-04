//   gender options
export const genderOptions = ["Male", "Female"].map((y) => ({ label: y, value: y }));

// admission year select option
export const admissionYearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((x) => ({
  label: x,
  value: x,
}));

// current year select option
export const currentYearOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
  { value: "6th Year", label: "6th Year" },
  { value: "7th Year", label: "7th Year" },
  { value: "8th Year", label: "8th Year" },
];

export const studentChapterOptions = [
  "AAU/ISTH",
  "Abia State University Teaching Hospital - ABSUTH",
  "ABSUTH",
  "ABUTH",
  "Abubakar Tafawa Balewa University Teaching Hospital - ATBUTH",
  "AE-FUTH",
  "Afe Babalola University Teaching Hospital - ABUADTH",
  "Ahmadu Bello University Teaching Hospital - ABUTH",
  "AKTH",
  "Alex Ekwueme University Teaching Hospital - AEFUTH",
  "Ambrose Alli University/ Irrua Specialist Teaching Hospital - AAU/ISTH",
  "Aminu Kano University Teaching Hospital - AKTH",
  "Barau-Dikko University Teaching Hospital - BDTH-KASU",
  "BDTH-KASU",
  "Benue State University Teaching Hospital - BSUTH",
  "Bingham University Teaching Hospital - BHUTH",
  "Bowen University Teaching Hospital - BUTH",
  "Chukwuemeka Odumegwu Ojukwu University Teaching Hospital - COOUTH",
  "Delta State University Teaching Hospital - DELSUTH",
  "EBSUTH",
  "Ebonyi State University Teaching Hospital - EBSUTH",
  "Ekiti State University Teaching Hospital - EKSUTH",
  "Enugu State University Teaching Hospital - ESUTH",
  "FUTH-LAFIA",
  "Gombe State University Teaching Hospital - GSUTH",
  "Gregory University Teaching Hospital - GUTH",
  "GSUTH",
  "GUTH",
  "Igbinedion University Teaching Hospital - IUTH",
  "Imo State University Teaching Hospital - IMSUTH",
  "IMSUTH",
  "Jos University Teaching Hospital - JUTH",
  "JUTH",
  "Lagos State University Teaching Hospital - LASUTH",
  "Lagos University Teaching Hospital - LUTH",
  "LASUTH",
  "Lautech Teaching Hospital - LTH",
  "Niger Delta University Teaching Hospital - NDUTH",
  "Nnamdi Azikiwe University Teaching Hospital - NAUTH",
  "Obafemi Awolowo University Teaching Hospital - OAUTH",
  "Olabisi Onabanjo University Teaching Hospital - OOUTH",
  "Osun State University Teaching Hospital - UNIOSUNTH",
  "RSUTH",
  "UDUTH",
  "University College Hospital - UCH",
  "University of Abuja Teaching Hospital - UATH",
  "University of Benin Teaching Hospital - UBTH",
  "University of Calabar Teaching Hospital - UCTH",
  "University of Ilorin Teaching Hospital - UITH",
  "University of Maiduguri Teaching Hospital - UMTH",
  "University of Medical Sciences Teaching Hospital (UNIMEDTH)",
  "University of Nigeria Teaching Hospital - UNTH",
  "University of Port Harcourt Teaching Hospital - UPTH",
  "University of Uyo Teaching Hospital – UUTH",
  "Usman Dan Fodio University Teaching Hospital - UDUTH",
].map((x) => ({
  label: x + " Chapter",
  value: x + " Chapter",
}));

export const doctorsRegionLists = [
  "Abia - Umahia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra (COOUTH)",
  "Anambra (NAUTH)",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "CMDA Uyo",
  "Cross River",
  "Delta - DELSUTH, Oghara",
  "Delta FMC, Asaba",
  "Ebonyi",
  "Edo-Benin",
  "Edo-SHMB",
  "Edo-Irrua",
  "Ekiti - Ido",
  "Ekiti-Ado",
  "Enugu",
  "FCT Gwagwalada",
  "FCT Municipal",
  "Gombe",
  "Imo",
  "Kaduna - Kaduna",
  "Kaduna - Zaria",
  "Kano",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos chapter",
  "Lagos-Lasuth",
  "Lagos-Luth",
  "LAUTECH",
  "Nasarawa - Keffi",
  "Nasarawa - Lafiya",
  "Niger-Bida",
  "Ogun - Abeokuta",
  "Ogun - Shagamu",
  "Ondo - Owo",
  "ONDO – UNIMEDTH",
  "Osun-Ife",
  "Osun-Osogbo",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
].map((x) => ({
  label: x,
  value: x,
}));

export const globalRegionsData = [
  "The Americas Region",
  "UK/Europe region",
  "Australasia Region",
  "Middle East Region",
  "Africa Region",
].map((x) => ({
  label: x,
  value: x,
}));

// get full name
export function getFullName(recipientData) {
  // Use optional chaining to access properties and handle potential 'undefined'
  const firstName = recipientData?.firstName;
  const middleName = recipientData?.middleName;
  const lastName = recipientData?.lastName;

  // Build the full name string with conditional checks
  if (firstName && lastName) {
    // Include middle name with space separators if it exists
    return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return "No Name";
  }
}

export function getCombinedId(id1, id2) {
  // Sort the IDs for consistent ordering
  if (id1 > id2) {
    [id1, id2] = [id2, id1];
  }
  // Combine the IDs with a separator (e.g., "-")
  return `${id1}-${id2}`;
}

export function extractTime(dateString) {
  const date = new Date(dateString);
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${hours}:${minutes}`;
}
function padZero(number) {
  return number.toString().padStart(2, "0");
}
