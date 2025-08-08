require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy if behind reverse proxy
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Server initialization logging
console.log(`Server initializing in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware with production configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'unsafe-hashes'",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net"
      ],
      "script-src-attr": ["'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com"
      ],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://api.groq.com",
        "https://api.perplexity.ai",
        "https://generativelanguage.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"]
    },
    reportOnly: false
  },
  crossOriginEmbedderPolicy: { requireCorp: false },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
  noSniff: true,
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  permittedCrossDomainPolicies: { permittedPolicies: "none" }
}));

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many API requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/api/', apiLimiter);

// Compression middleware
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API keys middleware with enhanced security
app.get('/api/keys', (req, res) => {
  try {
    const allowedOrigins = ['localhost', 'arogya-ai.vercel.app', 'render.com'];
    const origin = req.get('origin') || '';
    
    if (!allowedOrigins.some(allowed => origin.includes(allowed))) {
      return res.status(403).json({ error: 'Unauthorized origin' });
    }

    const keys = {
      groq: process.env.GROQ_API_KEY || '',
      perplexity: process.env.PERPLEXITY_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || ''
    };

    // Mask keys for logging
    const keysPresent = Object.entries(keys).reduce((acc, [key, value]) => {
      acc[key] = !!value;
      return acc;
    }, {});

    console.log(`API keys requested from: ${req.ip}`, keysPresent);
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle all routes by serving index.html from public directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running on http://localhost:${PORT}`);
});