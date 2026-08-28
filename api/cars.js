export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const BASE_ID = "apppjIMSlpOuE9S7G";
    const TABLE_NAME = "Cars";

    // Check token exists in Vercel
    if (!AIRTABLE_TOKEN) {
      console.error("AIRTABLE_TOKEN is missing.");

      return res.status(500).json({
        error: "AIRTABLE_TOKEN is not configured in Vercel."
      });
    }

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const response = await fetch(url, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    // Airtable returned an error
    if (!response.ok) {
      console.error("Airtable API error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.error?.type ||
          "Unable to load cars from Airtable."
      });
    }

    // Convert Airtable records into clean car objects
    const cars = (data.records || [])
      .map((record) => ({
        id: record.id,

        name:
          record.fields["Name"] || "",

        description:
          record.fields["Description"] || "",

        price:
          Number(
            record.fields["Price per Day"] || 0
          ),

        deposit:
          Number(
            record.fields["Deposit"] || 0
          ),

        available:
          record.fields["Available"] === true
      }))

      // Only return available cars with names
      .filter(
        (car) =>
          car.available === true &&
          car.name.trim() !== ""
      );

    // Prevent old availability results being cached
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.status(200).json(cars);

  } catch (error) {
    console.error("Cars API server error:", error);

    return res.status(500).json({
      error: "Unable to load cars."
    });
  }
}
