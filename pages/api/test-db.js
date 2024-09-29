// pages/api/test-db.js
import { query } from "../../utils/db";

export default async function handler(req, res) {
	try {
		const result = await query("SELECT NOW()");
		res.status(200).json({ success: true, result: result.rows });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
}
