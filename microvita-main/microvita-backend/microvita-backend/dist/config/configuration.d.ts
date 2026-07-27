declare const _default: () => {
    port: number;
    nodeEnv: string;
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    ai: {
        pythonUrl: string;
    };
};
export default _default;
