export declare class CreateDistributorDto {
    name: string;
    type: string;
    city: string;
    phone: string;
    products?: {
        name: string;
        image: string;
    }[];
    address?: string;
    openingHours?: string;
    deliveryAvailable?: boolean;
    minOrder?: string;
    paymentMethods?: string[];
    certifications?: string[];
}
