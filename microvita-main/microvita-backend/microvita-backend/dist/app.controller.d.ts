export declare class AppController {
    debugImages(): {
        path: string;
        exists: boolean;
        files: string[];
    }[];
    testImage(filename: string, res: any): Promise<any>;
}
