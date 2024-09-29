import db from "../utils/db";

const Post = {
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
		slug,
		isNewsletter,
		subscriberLevel
	) => {
		return db.one(
			"INSERT INTO posts(title, content, publishDate, coverImage, authorId, tags, status, excerpt, categories, views, likes, commentsEnabled, slug, isNewsletter, subscriberLevel) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
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
				isNewsletter,
				subscriberLevel,
			]
		);
	},
	findAll: async () => db.any("SELECT * FROM posts"),
	findById: async (id) =>
		db.oneOrNone("SELECT * FROM posts WHERE id = $1", [id]),
};

module.exports = Post;
