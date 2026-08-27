export default async function handler(req, res) {
  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = "apppjIMSlpOuE9S7G";
    const TABLE_NAME = "Cars";

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const cars = (data.records || [])
      .map(record => ({
        id: record.id,
        name: record.fields["Name"] || "",
        description: record.fields["Description"] || "",
        price: Number(record.fields["Price per Day"] || 0),
        deposit: Number(record.fields["Deposit"] || 0),
        available: record.fields["Available"] === true
      }))
      .filter(car => car.available && car.name);

    return res.status(200).json(cars);

  } catch (error) {
    return res.status(500).json({
      error: "Unable to load cars"
    });
  }
}
