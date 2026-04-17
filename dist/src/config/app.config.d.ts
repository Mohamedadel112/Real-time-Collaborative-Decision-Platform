declare const _default: (() => {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    frontendUrl: string;
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    frontendUrl: string;
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
}>;
export default _default;
