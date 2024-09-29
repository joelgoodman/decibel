import db from "../utils/db";

const User = {
	create: async (
		username,
		email,
		password,
		firstName,
		lastName,
		bio,
		avatar,
		role,
		status,
		signUpDate,
		subscriberLevel
	) => {
		return db.one(
			"INSERT INTO users(username, email, password, firstName, lastName, bio, avatar, role, status, signUpDate, subscriberLevel) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
			[
				username,
				email,
				password,
				firstName,
				lastName,
				bio,
				avatar,
				role,
				status,
				signUpDate,
				subscriberLevel,
			]
		);
	},
	findAll: async () => {
		return db.any("SELECT * FROM users");
	},
	findById: async (id) => {
		return db.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
	},
};

module.exports = User;
