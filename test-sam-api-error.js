// Test script to check SAM.gov API error
const apiKey = process.env.SAM_API_KEY || "SAM-f9e7d264-0a78-48f1-8e71-bdda905d10bf";

console.log("Testing SAM.gov API...");
console.log("API Key:", apiKey);
console.log("API Key length:", apiKey.length);
console.log("API Key (hex):", Buffer.from(apiKey).toString('hex'));

// Check for invisible characters
const hasNewline = apiKey.includes('\n');
const hasCarriageReturn = apiKey.includes('\r');
console.log("Has newline:", hasNewline);
console.log("Has carriage return:", hasCarriageReturn);

const baseUrl = "https://api.sam.gov/opportunities/v2/search";

// Calculate date range
const formatDate = (date) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
};

const today = new Date();
const oneYearAgo = new Date();
oneYearAgo.setDate(today.getDate() - 364);

const queryParams = new URLSearchParams({
  api_key: apiKey,
  postedFrom: formatDate(oneYearAgo),
  postedTo: formatDate(today),
  deptname: "GENERAL SERVICES ADMINISTRATION",
  subtier: "PUBLIC BUILDINGS SERVICE",
  ncode: "531120",
  ptype: "o,p,k,r,s",
  rdlfrom: formatDate(today),
  limit: "10",
  offset: "0",
});

const url = `${baseUrl}?${queryParams.toString()}`;

console.log("\nFetching from URL:");
console.log(url.substring(0, 200) + "...");

fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then(async (response) => {
    console.log("\nResponse status:", response.status);
    console.log("Response statusText:", response.statusText);

    const text = await response.text();

    if (!response.ok) {
      console.log("\n❌ ERROR Response:");
      console.log(text);
      return;
    }

    const data = JSON.parse(text);
    console.log("\n✅ SUCCESS:");
    console.log("Total records:", data.totalRecords);
    console.log("Opportunities found:", data.opportunitiesData?.length || 0);
  })
  .catch((error) => {
    console.error("\n❌ FETCH ERROR:", error.message);
  });
