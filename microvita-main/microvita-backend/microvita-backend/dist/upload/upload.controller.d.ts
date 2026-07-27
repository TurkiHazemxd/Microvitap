export declare class UploadController {
    uploadImage(file: Express.Multer.File): Promise<{
        success: boolean;
        filename: string;
        path: string;
    }>;
    uploadBase64(body: {
        base64: string;
        filename: string;
    }): Promise<{
        success: boolean;
        filename: string;
        path: string;
    }>;
    listImages(): Promise<{
        path: string;
        exists: boolean;
        images: string[];
    }>;
}
