import { connectDB } from "../../utils/db";

export default async function handler(req, res) {
	try {
		await connectDB();
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error); // Log the error for detailed debugging
		res.status(500).json({ success: false, error: error.message });
	}
}
