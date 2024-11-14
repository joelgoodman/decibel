// Add these methods to the existing user.ts file

export async function getUserProfile(userId: string) {
  const result = await query(
    `SELECT 
      u.id, u.email, u.name, u.avatar,
      u.preferences, u.created_at, u.last_login_at,
      array_agg(r.name) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = $1 AND u.deleted_at IS NULL
     GROUP BY u.id`,
    [userId]
  );

  return result.rows[0] || null;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    avatar?: string | null;
    preferences?: Record<string, any>;
  }
): Promise<User> {
  return transaction(async (query) => {
    const setFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      setFields.push(`name = $${paramCount}`);
      values.push(updates.name);
      paramCount++;
    }

    if (updates.avatar !== undefined) {
      setFields.push(`avatar = $${paramCount}`);
      values.push(updates.avatar);
      paramCount++;
    }

    if (updates.preferences !== undefined) {
      setFields.push(`preferences = preferences || $${paramCount}`);
      values.push(JSON.stringify(updates.preferences));
      paramCount++;
    }

    if (setFields.length === 0) {
      return getUserProfile(userId);
    }

    values.push(userId);
    const result = await query(
      `UPDATE users
       SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    return result.rows[0];
  });
}

export async function updateUserAvatar(
  userId: string,
  file: Express.Multer.File
): Promise<string> {
  // Upload to S3 or your preferred storage
  const key = `avatars/${userId}/${file.originalname}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  await query(
    `UPDATE users
     SET avatar = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [url, userId]
  );

  return url;
}