// Cloudflare R2 Storage Service
// R2 is S3-compatible, so we use AWS SDK
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'staging';
const R2_STAGING_BUCKET = process.env.R2_STAGING_BUCKET || 'staging';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;
const R2_ENDPOINT = R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : null;

// Initialize S3 client for R2
let s3Client = null;
if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    console.log('✅ R2 S3 Client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize R2 S3 Client:', error);
  }
} else {
  console.warn('⚠️ R2 credentials not fully configured');
}

// Check if R2 is configured
export function isR2Configured() {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

// Upload file to R2
export async function uploadToR2(fileBuffer, fileName, contentType, useStaging = false) {
  if (!isR2Configured()) {
    throw new Error('R2 storage is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY');
  }

  if (!s3Client) {
    throw new Error('R2 S3 Client not initialized. Check your R2 credentials.');
  }

  // Try staging bucket first, fallback to production if it doesn't exist
  let bucketName = useStaging ? R2_STAGING_BUCKET : R2_BUCKET_NAME;

  try {
    console.log(`Uploading to R2: bucket=${bucketName}, key=${fileName}, size=${fileBuffer.length}, contentType=${contentType}`);
    console.log(`R2 Endpoint: ${R2_ENDPOINT}`);
    console.log(`R2 Public URL: ${R2_PUBLIC_URL}`);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      // Note: R2 doesn't support ACL. Public access is controlled at bucket level.
    });

    await s3Client.send(command);

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${bucketName}/${fileName}`;
    
    console.log(`✅ File uploaded to R2: ${fileName}`);
    console.log(`Public URL: ${publicUrl}`);
    return {
      success: true,
      url: publicUrl,
      key: fileName,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.Code || error.code,
      name: error.name,
      stack: error.stack,
      $metadata: error.$metadata
    });
    
    // If bucket doesn't exist and we're using staging, try production bucket
    if ((error.Code === 'NoSuchBucket' || error.code === 'NoSuchBucket') && useStaging && bucketName === R2_STAGING_BUCKET) {
      console.log(`⚠️ Staging bucket ${R2_STAGING_BUCKET} doesn't exist. Trying production bucket ${R2_BUCKET_NAME}...`);
      bucketName = R2_BUCKET_NAME;
      
      try {
        const retryCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: fileBuffer,
          ContentType: contentType,
        });
        
        await s3Client.send(retryCommand);
        const publicUrl = `${R2_PUBLIC_URL}/${bucketName}/${fileName}`;
        console.log(`✅ File uploaded to R2 (production bucket): ${fileName}`);
        console.log(`Public URL: ${publicUrl}`);
        return {
          success: true,
          url: publicUrl,
          key: fileName,
          bucket: bucketName,
        };
      } catch (retryError) {
        console.error('Retry with production bucket also failed:', retryError);
        throw new Error(`Failed to upload to R2: Bucket '${bucketName}' doesn't exist. Please create bucket '${R2_BUCKET_NAME}' in Cloudflare R2.`);
      }
    }
    
    throw new Error(`Failed to upload to R2: ${error.message || error.Code || 'Unknown error'}`);
  }
}

// Upload audio recording
export async function uploadAudioRecording(fileBuffer, userId, useStaging = false) {
  const fileName = `audio/${userId}/audio-will-${Date.now()}.webm`;
  return uploadToR2(fileBuffer, fileName, 'audio/webm', useStaging);
}

// Upload video recording
export async function uploadVideoRecording(fileBuffer, userId, useStaging = false) {
  const fileName = `video/${userId}/video-will-${Date.now()}.webm`;
  return uploadToR2(fileBuffer, fileName, 'video/webm', useStaging);
}

// Get signed URL for private file (if needed)
export async function getSignedUrlForFile(fileName, expiresIn = 3600, useStaging = false) {
  if (!isR2Configured()) {
    throw new Error('R2 storage is not configured');
  }

  const bucketName = useStaging ? R2_STAGING_BUCKET : R2_BUCKET_NAME;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

// Delete file from R2
export async function deleteFromR2(fileName, useStaging = false) {
  if (!isR2Configured()) {
    throw new Error('R2 storage is not configured');
  }

  const bucketName = useStaging ? R2_STAGING_BUCKET : R2_BUCKET_NAME;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    await s3Client.send(command);
    console.log(`✅ File deleted from R2: ${fileName}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error(`Failed to delete from R2: ${error.message}`);
  }
}

// Get public URL for a file
export function getPublicUrl(fileName, useStaging = false) {
  const bucketName = useStaging ? R2_STAGING_BUCKET : R2_BUCKET_NAME;
  return `${R2_PUBLIC_URL}/${bucketName}/${fileName}`;
}
