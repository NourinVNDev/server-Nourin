import 'multer-storage-cloudinary';

declare module 'multer-storage-cloudinary' {
  interface CloudinaryStorageOptions {
    params?: {
      folder?: string;
      format?: string | ((req: Express.Request, file: Express.Multer.File) => string);
      public_id?: string | ((req: Express.Request, file: Express.Multer.File) => string);
    };
  }
}
