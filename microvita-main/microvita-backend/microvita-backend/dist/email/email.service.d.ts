export declare class EmailService {
    private transporter;
    constructor();
    sendPasswordResetCode(to: string, name: string, code: string): Promise<void>;
}
