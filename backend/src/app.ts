import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { swaggerSpec } from './docs/swagger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import leadRoutes from './modules/leads/lead.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
  customSiteTitle: 'LeadFlow CRM API Docs',
}));

// Hello check
app.get('/api/v1/hello', (_req, res) => {
  res.json({
    success: true,
    message: 'Hello from LeadFlow CRM API',
  });
});

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LeadFlow CRM API is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 & error handling
app.use(notFound);
app.use(errorHandler);

export default app;
