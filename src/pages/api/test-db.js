// src/pages/api/test-db.js
import { connectDB } from "../../utils/db";

export default async function handler(req, res) {
	try {
		await connectDB();
		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
}
