import db from "../../utils/db";

export default async function handler(req, res) {
	try {
		const result = await db.any("SELECT 1");
		res.status(200).json({ success: true, result });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
}
