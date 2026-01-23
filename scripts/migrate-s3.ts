import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { ListObjectsV2CommandOutput, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrateFilePath = path.resolve(__dirname, '../MIGRATE');

interface S3Config {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

function parseConfig(content: string): { tebi: S3Config; scale: S3Config } {
  const lines = content.split('\n');
  const config: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, value] = trimmed.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  }

  return {
    tebi: {
      endpoint: config.TEBI_ENDPOINT,
      accessKey: config.TEBI_ACCESS_KEY,
      secretKey: config.TEBI_SECRET_KEY,
      bucket: config.TEBI_BUCKET,
    },
    scale: {
      endpoint: config.SCALE_ENDPOINT,
      accessKey: config.SCALE_ACCESS_KEY,
      secretKey: config.SCALE_SECRET_KEY,
      bucket: config.SCALE_BUCKET,
    },
  };
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function main() {
  console.log('Reading configuration from:', migrateFilePath);
  
  if (!fs.existsSync(migrateFilePath)) {
    console.error('MIGRATE file not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(migrateFilePath, 'utf-8');
  const { tebi, scale } = parseConfig(content);

  console.log('Configuration loaded.');
  console.log('Source (TEBI):', tebi.endpoint, tebi.bucket);
  console.log('Destination (SCALE):', scale.endpoint, scale.bucket);

  const tebiClient = new S3Client({
    endpoint: tebi.endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: tebi.accessKey,
      secretAccessKey: tebi.secretKey,
    },
  });

  const scaleClient = new S3Client({
    endpoint: scale.endpoint,
    region: 'fr-par',
    credentials: {
      accessKeyId: scale.accessKey,
      secretAccessKey: scale.secretKey,
    },
  });

  console.log('Starting migration (FORCE OVERWRITE mode)...');
  console.log('All objects will be set to PUBLIC READ access.');

  let continuationToken: string | undefined = undefined;
  let totalCopied = 0;
  let totalErrors = 0;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: tebi.bucket,
      ContinuationToken: continuationToken,
    });

    try {
      const listResponse: ListObjectsV2CommandOutput = await tebiClient.send(listCommand);
      const objects = listResponse.Contents || [];

      if (objects.length === 0) {
        console.log('No objects found in source bucket.');
        break;
      }

      console.log(`Found ${objects.length} objects to process...`);

      for (const obj of objects) {
        if (!obj.Key) continue;
        
        const key = obj.Key;
        // Skip directory markers if any (keys ending in /)
        if (key.endsWith('/')) {
           console.log(`Skipping directory marker: ${key}`);
           continue;
        }

        console.log(`Processing: ${key}`);

        try {
          const getCommand = new GetObjectCommand({
            Bucket: tebi.bucket,
            Key: key,
          });
          const getResponse: GetObjectCommandOutput = await tebiClient.send(getCommand);
          
          if (!getResponse.Body) {
             console.log(`Empty body for ${key}, skipping.`);
             continue;
          }

          const bodyBuffer = await streamToBuffer(getResponse.Body as Readable);

          const putCommand = new PutObjectCommand({
            Bucket: scale.bucket,
            Key: key,
            Body: bodyBuffer,
            ContentType: getResponse.ContentType,
            ContentLength: bodyBuffer.length, 
            Metadata: getResponse.Metadata,
            ACL: 'public-read', // Force Public Read Access
            CacheControl: getResponse.CacheControl || 'public, max-age=31536000', // Preserve or set default cache
          });

          await scaleClient.send(putCommand);
          console.log(`✅ Copied (PUBLIC): ${key} (${bodyBuffer.length} bytes)`);
          totalCopied++;
        } catch (error: any) {
          console.error(`❌ Error copying ${key}:`, error.message);
          totalErrors++;
        }
      }

      continuationToken = listResponse.NextContinuationToken;

    } catch (error: any) {
      console.error('Error listing objects:', error.message);
      break;
    }

  } while (continuationToken);

  console.log('Migration completed.');
  console.log(`Total copied: ${totalCopied}`);
  console.log(`Total errors: ${totalErrors}`);
}

main().catch(console.error);
