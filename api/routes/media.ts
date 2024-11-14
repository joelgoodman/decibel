<script lang="ts">
import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { randomUUID } from 'crypto';

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

router.post('/upload',
  authenticate,
  checkPermission('upload:media'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const fileId = randomUUID();
      const key = `uploads/${fileId}-${req.file.originalname}`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          userId: req.user!.id,
          originalName: req.file.originalname
        }
      }));

      const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }
);

export const mediaRoutes = router;
</script>