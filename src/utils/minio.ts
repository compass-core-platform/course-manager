import * as Minio from 'minio';

const endPoint = process.env.MINIO_ENDPOINT!;

// Replace these values with your Minio server details
const minioClient = new Minio.Client({
  endPoint: endPoint,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// Replace these values with your bucket and object details
const bucketName = process.env.MINIO_BUCKET_NAME!;

// Function to upload a file to Minio
export async function uploadFile(objectName: string, fileBuffer: Buffer) {

  // Check if the bucket exists, if not, create it
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      throw new Error("Bucket not found")
    }

    // Remove the file if it already exists
    await minioClient.removeObject(bucketName, objectName);
    
    // Upload the file to the specified bucket and object
    await minioClient.putObject(bucketName, objectName, fileBuffer);
    // console.log('File uploaded successfully!');

    // minioClient.presignedUrl('GET', bucketName, objectName, 24 * 60 * 60, function (err, presignedUrl) {
    //   if (err) return console.log(err)
    //   console.log(presignedUrl)
    // })

    return `https://${endPoint}/${bucketName}/${objectName}`
}

