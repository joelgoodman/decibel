import db from "../utils/db";

const Podcast = {
	create: async (
		title,
		description,
		coverImage,
		hostId,
		categories,
		rssFeed,
		episodesCount
	) => {
		return db.one(
			"INSERT INTO podcasts(title, description, coverImage, hostId, categories, rssFeed, episodesCount) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
			[
				title,
				description,
				coverImage,
				hostId,
				categories,
				rssFeed,
				episodesCount,
			]
		);
	},
	findAll: async () => db.any("SELECT * FROM podcasts"),
	findById: async (id) =>
		db.oneOrNone("SELECT * FROM podcasts WHERE id = $1", [id]),
};

module.exports = Podcast;
