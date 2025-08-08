# Arogya AI - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- Docker (optional)
- Valid API keys for Groq, Perplexity, and/or Gemini

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Required API Keys (at least one must be provided)
GROQ_API_KEY=your_groq_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
NODE_ENV=production
PORT=3000
```

### Local Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

4. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t arogya-ai .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Check Container Health**
   ```bash
   docker-compose ps
   ```

### Cloud Deployment

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Railway/Render
1. Connect repository
2. Set environment variables
3. Deploy with automatic builds

#### AWS/GCP/Azure
1. Use the provided Dockerfile
2. Set up container registry
3. Deploy to container service (ECS, Cloud Run, Container Instances)

### Performance Optimizations

- **Compression**: Enabled for all responses
- **Rate Limiting**: API endpoints limited to prevent abuse
- **Security Headers**: Comprehensive security headers via Helmet
- **Error Handling**: Graceful error handling with user feedback
- **Logging**: Structured logging for monitoring

### Monitoring

- Health check endpoint: `/api/health`
- Logs include timestamps and severity levels
- Error tracking for API failures
- Performance metrics available

### Security Features

- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting
- Secure headers
- API key protection

### Troubleshooting

1. **Server won't start**: Check environment variables and port availability
2. **API errors**: Verify API keys are valid and have sufficient quota
3. **PDF generation fails**: Ensure browser supports required libraries
4. **Rate limiting**: Reduce request frequency or contact admin

For support, check the logs and health endpoint first.

## 🌐 **One-Click Deployments**

### **Deploy to Vercel**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vicky-a1/arogya-bot)

1. Click the deploy button above
2. Connect your GitHub account
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### **Deploy to Railway**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/vicky-a1/arogya-bot)

1. Click the deploy button above
2. Connect your GitHub account
3. Set environment variables
4. Deploy with automatic builds

### **Deploy to Render**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vicky-a1/arogya-bot)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy with automatic builds

## 🔧 **Manual Deployment Steps**

### **1. Clone Repository**
```bash
git clone https://github.com/vicky-a1/arogya-bot.git
cd arogya-bot
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

### **4. Test Locally**
```bash
npm test
npm start
```

### **5. Deploy to Production**
Choose your preferred platform and follow the specific instructions above.

## 📊 **Monitoring & Maintenance**

### **Health Monitoring**
- Endpoint: `/api/health`
- Returns: Server status, uptime, version
- Use for: Load balancer health checks

### **Log Monitoring**
- Structured logging with timestamps
- Error tracking and debugging
- Performance metrics

### **API Monitoring**
- Rate limiting metrics
- API response times
- Provider fallback statistics

## 🔐 **Security Checklist**

- [ ] Environment variables properly set
- [ ] API keys secured and not exposed
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation active
- [ ] Error handling implemented

## 🚀 **Performance Optimization**

- [ ] Compression enabled
- [ ] Static file caching
- [ ] API response caching
- [ ] Database connection pooling (if applicable)
- [ ] CDN configuration (if applicable)

## 📞 **Support**

For deployment issues:
1. Check the health endpoint: `/api/health`
2. Review application logs
3. Verify environment variables
4. Test API connectivity
5. Check rate limiting status

For technical support, create an issue in the GitHub repository.
