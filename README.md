# Arogya AI - Professional Health Assessment Tool

![Arogya AI Banner](public/favicon.svg)

Arogya AI is a compassionate, culturally-aware AI medical assistant designed for Indian users. It guides users through structured, human-friendly conversations to understand symptoms, give preliminary suggestions, and generate a professional, doctor-friendly medical report in PDF format.

## 🌟 Features

### Memory Optimization
- **Efficient Resource Usage**: Optimized for low memory environments (512MB)
- **Multi-stage Docker Build**: Minimized image size and build memory usage
- **Production-ready Settings**: Configured for optimal performance on cloud platforms

### Core Functionality
- **Multi-AI Provider Support**: Robust fallback system with Groq, Perplexity, and Gemini APIs
- **Multiple Groq Models**: Automatic fallback through 5 different Groq models for maximum reliability
- **Intelligent Conversations**: Contextual, empathetic medical consultations in multiple languages
- **Emergency Detection**: Real-time detection of medical emergencies with immediate alerts
- **Professional Reports**: Generate downloadable PDF medical assessment reports
- **Cultural Sensitivity**: Designed specifically for Indian healthcare context and cultural norms

### Technical Excellence
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Security First**: Input validation, rate limiting, XSS protection, and secure headers
- **Performance Optimized**: Compression, caching, and efficient resource management
- **Fully Tested**: Comprehensive test suite with health checks and API validation
- **Docker Support**: Complete containerization with health checks and monitoring
- **Zero Downtime**: Automatic failover between AI providers ensures continuous service

## 🚀 Quick Start

### Clone and Install
```bash
git clone https://github.com/vicky-a1/arogya-ai-lang.git
cd arogya-ai-lang
npm install
```

### Set Environment Variables
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Run Tests
```bash
npm test
```

### Start Application
```bash
npm start
```

### Access Application
- Open http://localhost:8080
- Health check: http://localhost:8080/api/health

## 🔧 API Configuration

The application supports multiple AI providers with automatic fallback:

### Groq API (Primary)
- Models: llama-3.1-70b-versatile, llama3-70b-8192, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma-7b-it
- Automatic model fallback ensures maximum uptime
- Get API key: https://console.groq.com/

### Perplexity API (Fallback)
- Model: llama-3.1-sonar-small-128k-online
- Get API key: https://www.perplexity.ai/settings/api

### Gemini API (Fallback)
- Model: gemini-pro
- Get API key: https://makersuite.google.com/app/apikey

*Note: At least one API key is required, but having all three provides maximum reliability.*

## 🚀 Deployment Options

### Option 1: Docker (Recommended)
```bash
# Clone repository
git clone https://github.com/vicky-a1/arogya-ai-lang.git
cd arogya-ai-lang

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run with Docker Compose
docker-compose up -d
```

### Option 2: Manual Deployment
```bash
# Clone and setup
git clone https://github.com/vicky-a1/arogya-ai-lang.git
cd arogya-ai-lang
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start application
npm start
```

## 🔧 Environment Variables

| Variable | Required | Description | Where to get |
|----------|----------|-------------|--------------|
| GROQ_API_KEY | Yes* | Primary AI provider | console.groq.com |
| PERPLEXITY_API_KEY | No | Fallback AI provider | perplexity.ai/settings/api |
| GEMINI_API_KEY | No | Fallback AI provider | makersuite.google.com |
| NODE_ENV | No | Environment mode | production or development |
| PORT | No | Server port | Default: 8080 |

*At least one AI provider API key is required

## 📊 Features Overview

- ✅ Multi-AI Provider Support with automatic failover
- ✅ 5 Groq Models with intelligent fallback
- ✅ Emergency Detection with real-time alerts
- ✅ PDF Report Generation for medical assessments
- ✅ Multi-language Support (English, Hindi, Marathi, Kannada)
- ✅ Production Security with rate limiting and input validation
- ✅ Health Monitoring with /api/health endpoint
- ✅ Docker Support for containerized deployment
- ✅ Zero Downtime architecture with comprehensive error handling

## 🏥 Medical Capabilities

### Symptom Analysis
- Comprehensive symptom tracking and analysis
- Timeline creation for symptom progression
- Severity assessment (mild, moderate, severe)
- Associated symptoms identification

### Emergency Detection
- Chest pain and cardiac symptoms
- Breathing difficulties and respiratory issues
- Neurological symptoms (stroke, seizures)
- Severe pain and bleeding
- Loss of consciousness

### Report Generation
- Professional medical assessment reports
- Symptom summary and timeline
- Recommendations and next steps
- Cultural remedies and lifestyle advice
- Doctor-friendly format for consultations

## ⚠️ Important Disclaimer

Arogya AI is not a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or heard from Arogya AI.

## 🔒 Privacy

Arogya AI prioritizes user privacy:
- No personal health information is permanently stored
- Conversations are not saved after the session ends
- PDF reports are generated locally on your device

## 🛠️ Technologies Used

- HTML5, CSS3, JavaScript
- Node.js and Express for server-side functionality
- Environment variables for secure API key management
- GROQ API (llama3-70b-8192 model) for AI-powered health assessment
- jsPDF for professional PDF report generation
- html2canvas for high-quality report capture
- Docker for containerization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- World Health Organization (WHO)
- Centers for Disease Control and Prevention (CDC)
- Indian Council of Medical Research (ICMR)
- Ministry of Health and Family Welfare (MoHFW), Government of India
<<<<<<< HEAD
=======

>>>>>>> 4fa1b31211966beafdecb0d85ceb50023fcf9d73
