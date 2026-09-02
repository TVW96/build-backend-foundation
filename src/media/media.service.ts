import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { DataSource, Repository } from "typeorm";

import { User } from "../users/entities/user.entity";
import { type PublicAccount, UsersService } from "../users/users.service";
import {
  EntityImage,
  ImagePublicationSource,
} from "./entities/entity-image.entity";
import {
  MediaAsset,
  MediaAssetOriginType,
  MediaAssetStatus,
} from "./entities/media-asset.entity";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const AVATAR_BUCKET = "avatars";
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type AvatarUpload = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@Injectable()
export class MediaService {
  private supabaseClient: SupabaseClient | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetsRepository: Repository<MediaAsset>,
    @InjectRepository(EntityImage)
    private readonly entityImagesRepository: Repository<EntityImage>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async uploadAvatar(
    token: string,
    file: AvatarUpload,
  ): Promise<PublicAccount> {
    this.validateAvatar(file);
    const user = await this.usersService.requireAuthenticatedUser(token);
    const client = this.getSupabaseClient();
    const assetId = randomUUID();
    const extension = MIME_EXTENSIONS[file.mimetype];
    const objectKey = `users/${user.userId}/avatars/${assetId}.${extension}`;

    const { error: uploadError } = await client.storage
      .from(AVATAR_BUCKET)
      .upload(objectKey, file.buffer, {
        cacheControl: "31536000",
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new BadGatewayException(
        `Avatar storage rejected the upload: ${uploadError.message}`,
      );
    }

    const publicUrl = client.storage.from(AVATAR_BUCKET).getPublicUrl(objectKey)
      .data.publicUrl;
    const previousAsset = user.avatarAssetId
      ? await this.mediaAssetsRepository.findOneBy({
          assetId: user.avatarAssetId,
        })
      : null;
    const previousImageId = user.avatarImageId;

    try {
      await this.dataSource.transaction(async (manager) => {
        const asset = manager.getRepository(MediaAsset).create({
          assetId,
          uploadedByUserId: user.userId,
          originType: MediaAssetOriginType.USER_UPLOAD,
          originReference: `user:${user.userId}/account-avatar`,
          derivedFromAssetId: null,
          storageProvider: "supabase",
          bucket: AVATAR_BUCKET,
          objectKey,
          mimeType: file.mimetype,
          byteSize: String(file.size),
          width: null,
          height: null,
          originalFileName: this.normalizeFileName(file.originalname),
          sourceUrl: null,
          status: MediaAssetStatus.READY,
        });

        await manager.getRepository(MediaAsset).save(asset);

        if (previousImageId) {
          await manager
            .getRepository(User)
            .update(
              { userId: user.userId },
              { avatarAssetId: null, avatarImageId: null, avatarUrl: null },
            );
          await manager
            .getRepository(EntityImage)
            .delete({ imageId: previousImageId, userId: user.userId });
        }

        const publication = manager.getRepository(EntityImage).create({
          assetId,
          publishedByUserId: user.userId,
          publicationSource: ImagePublicationSource.USER_UPLOAD,
          publicationOrigin: `user:${user.userId}/account-avatar`,
          originImageId: null,
          userId: user.userId,
          catalogProductId: null,
          inventoryItemId: null,
          listingId: null,
          listingItemId: null,
          position: 0,
          altText: `${user.fullName} profile photo`,
        });
        const savedPublication = await manager
          .getRepository(EntityImage)
          .save(publication);

        await manager.getRepository(User).update(
          { userId: user.userId },
          {
            avatarAssetId: assetId,
            avatarImageId: savedPublication.imageId,
            avatarUrl: publicUrl,
          },
        );
      });
    } catch (error: unknown) {
      await client.storage.from(AVATAR_BUCKET).remove([objectKey]);
      throw error;
    }

    if (previousAsset?.bucket === AVATAR_BUCKET) {
      await this.deleteDetachedAsset(previousAsset, client);
    }

    return this.usersService.getAccount(token);
  }

  async removeAvatar(token: string): Promise<PublicAccount> {
    const user = await this.usersService.requireAuthenticatedUser(token);
    const previousAsset = user.avatarAssetId
      ? await this.mediaAssetsRepository.findOneBy({
          assetId: user.avatarAssetId,
        })
      : null;

    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(User)
        .update(
          { userId: user.userId },
          { avatarAssetId: null, avatarImageId: null, avatarUrl: null },
        );
      if (user.avatarImageId) {
        await manager
          .getRepository(EntityImage)
          .delete({ imageId: user.avatarImageId, userId: user.userId });
      }
    });

    if (previousAsset?.bucket === AVATAR_BUCKET) {
      await this.deleteDetachedAsset(previousAsset, this.getSupabaseClient());
    }

    return this.usersService.getAccount(token);
  }

  private getSupabaseClient(): SupabaseClient {
    if (this.supabaseClient) return this.supabaseClient;

    const url = this.configService.get<string>("SUPABASE_URL")?.trim();
    const key = this.configService
      .get<string>("SUPABASE_SERVICE_ROLE_KEY")
      ?.trim();

    if (!url || !key) {
      throw new ServiceUnavailableException(
        "Avatar storage is not configured on the server.",
      );
    }

    this.supabaseClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return this.supabaseClient;
  }

  private validateAvatar(file: AvatarUpload): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException("Choose an image to upload.");
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException("Avatar images must be 2 MB or smaller.");
    }
    if (!MIME_EXTENSIONS[file.mimetype]) {
      throw new BadRequestException("Use a JPEG, PNG, WebP, or AVIF image.");
    }
    if (!this.matchesImageSignature(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        "The selected file does not contain a valid supported image.",
      );
    }
  }

  private matchesImageSignature(buffer: Buffer, mimeType: string): boolean {
    if (mimeType === "image/jpeg") {
      return (
        buffer.length >= 3 &&
        buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
      );
    }
    if (mimeType === "image/png") {
      return (
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    }
    if (mimeType === "image/webp") {
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    }
    if (mimeType === "image/avif") {
      const brand = buffer.subarray(8, 12).toString("ascii");
      return (
        buffer.length >= 12 &&
        buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
        (brand === "avif" || brand === "avis")
      );
    }
    return false;
  }

  private normalizeFileName(fileName: string): string {
    return (
      fileName.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "avatar"
    );
  }

  private async deleteDetachedAsset(
    asset: MediaAsset,
    client: SupabaseClient,
  ): Promise<void> {
    const [publicationCount, avatarCount] = await Promise.all([
      this.entityImagesRepository.countBy({ assetId: asset.assetId }),
      this.dataSource.getRepository(User).countBy({
        avatarAssetId: asset.assetId,
      }),
    ]);
    if (publicationCount + avatarCount > 0) return;

    const { error } = await client.storage
      .from(asset.bucket)
      .remove([asset.objectKey]);

    if (!error) {
      await this.mediaAssetsRepository.delete({ assetId: asset.assetId });
    }
  }
}
