import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: any;
            email: string;
            name: string;
            role: import("../users/schemas/user.schema").UserRole;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/schemas/user.schema").UserRole;
        };
        token: string;
    }>;
    requestReset(requestResetDto: RequestResetDto): Promise<{
        message: string;
    }>;
    verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto): Promise<{
        valid: boolean;
    }>;
    resetPasswordWithCode(resetPasswordWithCodeDto: ResetPasswordWithCodeDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
