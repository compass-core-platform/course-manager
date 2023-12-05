import * as Minio from 'minio';

// Replace these values with your Minio server details
const minioClient = new Minio.Client({
  endPoint: 'http://10.212.3.229',
  port: 9000,
  useSSL: false,
  accessKey: 'E7lmj73hampENjtjaS85',
  secretKey: 'JS8T9GhvCR8k8yRLcyJoFRxhjbv9ys2o46ZblC7S',
});

// Replace these values with your bucket and object details
const bucketName = 'bucket1';
const objectName = 'file1.txt';
const filePath = 'path/to/your/local/file.txt';

// Function to upload a file to Minio
async function uploadFile(objectName: string, filePath: string) {
  try {
    // Check if the bucket exists, if not, create it
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }

    // Upload the file to the specified bucket and object
    await minioClient.fPutObject(bucketName, objectName, filePath);

    console.log('File uploaded successfully!');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

