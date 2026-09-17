export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-only-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-only-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-flash-latest',
  },
  nominatim: {
    baseUrl: process.env.NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org',
    userAgent: process.env.NOMINATIM_USER_AGENT ?? 'prism-cadastral-platform/1.0',
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '500', 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
