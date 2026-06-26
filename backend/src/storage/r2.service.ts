import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class R2Service {
  private s3Client: S3Client | null = null;
  private logger = new Logger("R2Service");
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>("R2_BUCKET") || "";
    const endpoint = this.configService.get<string>("R2_ENDPOINT");
    const accessKeyId = this.configService.get<string>("R2_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "R2_SECRET_ACCESS_KEY",
    );

    if (endpoint && accessKeyId && secretAccessKey && this.bucket) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log("✅ R2 storage configured");
    } else {
      this.logger.warn(
        "⚠️ R2 is not configured (R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET). Speaking submissions will fail to store audio.",
      );
    }
  }

  get isConfigured(): boolean {
    return this.s3Client !== null;
  }

  private client(): S3Client {
    if (!this.s3Client) {
      throw new Error(
        "R2 storage is not configured. Set R2_* variables in .env",
      );
    }
    return this.s3Client;
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType = "audio/wav",
  ): Promise<void> {
    await this.client().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.log(`✅ Uploaded to R2: ${key}`);
  }

  /** Presigned GET URL (R2 buckets are private by default). */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      this.client(),
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
