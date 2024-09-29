import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialect: "postgres",
});

const connectDB = async () => {
	try {
		console.log("DATABASE_URL:", process.env.DATABASE_URL); // Log the DATABASE_URL
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { sequelize, connectDB };
