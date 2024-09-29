import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
	dialect: "postgres",
});

export const connectDB = async () => {
	try {
		console.log("POSTGRES_URL:", process.env.POSTGRES_URL); // Log the POSTGRES_URL
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

export default sequelize;