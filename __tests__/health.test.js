const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the server setup
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock environment variables
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.PERPLEXITY_API_KEY = 'test-perplexity-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';

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

// API keys endpoint
app.get('/api/keys', (req, res) => {
  res.json({
    groq: process.env.GROQ_API_KEY || '',
    perplexity: process.env.PERPLEXITY_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  });
});

describe('Arogya AI Server Tests', () => {
  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('API Keys', () => {
    test('should return API keys', async () => {
      const response = await request(app)
        .get('/api/keys')
        .expect(200);

      expect(response.body.groq).toBe('test-groq-key');
      expect(response.body.perplexity).toBe('test-perplexity-key');
      expect(response.body.gemini).toBe('test-gemini-key');
    });
  });

  describe('Static Files', () => {
    test('should serve static files', async () => {
      const response = await request(app)
        .get('/index.html')
        .expect(200);

      expect(response.text).toContain('Arogya AI');
    });
  });
});