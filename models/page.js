import db from "../utils/db";

const Page = {
	create: async (
		title,
		content,
		publishDate,
		coverImage,
		authorId,
		tags,
		status,
		excerpt,
		categories,
		views,
		likes,
		commentsEnabled,
		slug
	) => {
		return db.one(
			"INSERT INTO pages(title, content, publishDate, coverImage, authorId, tags, status, excerpt, categories, views, likes, commentsEnabled, slug) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
			[
				title,
				content,
				publishDate,
				coverImage,
				authorId,
				tags,
				status,
				excerpt,
				categories,
				views,
				likes,
				commentsEnabled,
				slug,
			]
		);
	},
	findAll: async () => db.any("SELECT * FROM pages"),
	findById: async (id) =>
		db.oneOrNone("SELECT * FROM pages WHERE id = $1", [id]),
};

module.exports = Page;
