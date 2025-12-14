// ============================================================================
// MinIO/S3 Storage Client
// ============================================================================

import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'govcon',
  secretKey: process.env.MINIO_SECRET_KEY || 'govcon_minio_password',
});

const BUCKET_NAME = 'govcon-documents';

export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    console.log(`Bucket '${BUCKET_NAME}' created`);
  }
}

export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const objectName = `${Date.now()}_${fileName}`;
  await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
  });
  return objectName;
}

export async function getFile(objectName: string): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const stream = await minioClient.getObject(BUCKET_NAME, objectName);

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, objectName);
}

export async function getPresignedUrl(
  objectName: string,
  expirySeconds = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(
    BUCKET_NAME,
    objectName,
    expirySeconds
  );
}

export default minioClient;
