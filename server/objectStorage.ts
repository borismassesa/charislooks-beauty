import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getDefaultBucketId(): string {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
    if (bucketId.length === 0) {
      throw new Error(
        "DEFAULT_OBJECT_STORAGE_BUCKET_ID not set. Create a bucket in 'Object Storage' tool."
      );
    }
    return bucketId;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (dir.length === 0) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    const publicObjectSearchPaths = this.getPublicObjectSearchPaths();
    for (const searchPath of publicObjectSearchPaths) {
      const parts = searchPath.split("/").filter((part) => part.length > 0);
      if (parts.length < 2) {
        console.error(`Invalid search path: ${searchPath}`);
        continue;
      }
      const bucketId = parts[0];
      const objectPathPrefix = parts.slice(1).join("/");
      const objectPath = `${objectPathPrefix}/${filePath}`;
      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(objectPath);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  async downloadObject(file: File, res: Response): Promise<void> {
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    file.createReadStream().pipe(res);
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const bucketId = this.getDefaultBucketId();
    const privateObjectDir = this.getPrivateObjectDir();
    const objectPath = `${privateObjectDir}/${randomUUID()}`;
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(objectPath);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "application/octet-stream",
    });
    return url;
  }

  normalizeObjectEntityPath(objectURL: string): string {
    const bucketId = this.getDefaultBucketId();
    const privateObjectDir = this.getPrivateObjectDir();
    const urlObj = new URL(objectURL);
    const pathParts = urlObj.pathname.split("/").filter((part) => part.length > 0);
    if (pathParts.length < 2) {
      throw new Error(`Invalid object URL: ${objectURL}`);
    }
    const objectPath = pathParts.slice(1).join("/");
    if (!objectPath.startsWith(privateObjectDir)) {
      throw new Error(
        `Object path does not start with private object dir: ${objectPath}`
      );
    }
    return `/${bucketId}/${objectPath}`;
  }

  async getObjectEntityFile(objectEntityPath: string): Promise<File> {
    const pathParts = objectEntityPath
      .split("/")
      .filter((part) => part.length > 0);
    if (pathParts.length < 2) {
      throw new Error(`Invalid object entity path: ${objectEntityPath}`);
    }
    const bucketId = pathParts[0];
    const objectPath = pathParts.slice(1).join("/");
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return file;
  }

  async trySetObjectEntityAclPolicy(
    objectURL: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const objectPath = this.normalizeObjectEntityPath(objectURL);
    const objectFile = await this.getObjectEntityFile(objectPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return objectPath;
  }

  async canAccessObjectEntity({
    objectFile,
    userId,
    requestedPermission,
  }: {
    objectFile: File;
    userId?: string;
    requestedPermission: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({ userId, objectFile, requestedPermission });
  }
}
