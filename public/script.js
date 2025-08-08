// Global state management
const state = {
    language: 'english',
    phase: 'initial',
    userInfo: {},
    history: [],
    symptoms: {},
    aiResponse: '',
    isComplete: false
};

// Production error handling
window.addEventListener('error', function(e) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', e.error);
    }
});

window.addEventListener('unhandledrejection', function(e) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Promise Error:', e.reason);
    }
});

// API Keys - Multi-Model Fallback Strategy (Loaded from environment variables)
const API_KEYS = {
    GROQ: '',      // Will be loaded from server
    PERPLEXITY: '', // Will be loaded from server
    GEMINI: ''      // Will be loaded from server
};

// AI Model Configuration
const AI_MODELS = [
    {
        name: 'mixtral-8x7b',
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        priority: 1
    },
    {
        name: 'gemini-pro',
        provider: 'gemini',
        model: 'gemini-pro',
        priority: 3,
        description: 'Fast, safe fallback for translation and reasoning'
    }
];

let currentModelIndex = 0;

// Language Translations
const translations = {
    english: {
        welcome: "Namaste! I'm Dr. Arogya, your personal health companion. How can I help you today?",
        infoTitle: "Let me know you better",
        continueBtn: "Continue",
        reportBtn: "Generate Health Report",
        newConsultBtn: "New Consultation",
        disclaimer: "🔒 Disclaimer: Dr. Arogya is not a licensed doctor. Always consult a healthcare professional for serious conditions.",
        loading: "Dr. Arogya is thinking...",
        emergency: "This may be an emergency. Please seek immediate medical help or go to the nearest hospital.",
        languageLabel: "Choose Language / भाषा चुनें:",
        namePlaceholder: "Your Name",
        agePlaceholder: "Age",
        cityPlaceholder: "City",
        genderSelect: "Select Gender",
        male: "Male",
        female: "Female",
        other: "Other",
        messagePlaceholder: "Type your message..."
    },
    hindi: {
        welcome: "नमस्ते! मैं डॉ. आरोग्य हूं, आपका व्यक्तिगत स्वास्थ्य साथी। आज मैं आपकी कैसे मदद कर सकता हूं?",
        infoTitle: "मुझे आपके बारे में बताएं",
        continueBtn: "जारी रखें",
        reportBtn: "स्वास्थ्य रिपोर्ट बनाएं",
        newConsultBtn: "नई सलाह",
        disclaimer: "🔒 अस्वीकरण: डॉ. आरोग्य एक लाइसेंसी डॉक्टर नहीं है। गंभीर स्थितियों के लिए हमेशा स्वास्थ्य पेशेवर से सलाह लें।",
        loading: "डॉ. आरोग्य सोच रहे हैं...",
        emergency: "यह एक आपातकाल हो सकता है। कृपया तुरंत चिकित्सा सहायता लें या निकटतम अस्पताल जाएं।",
        languageLabel: "भाषा चुनें:",
        namePlaceholder: "आपका नाम",
        agePlaceholder: "उम्र",
        cityPlaceholder: "शहर",
        genderSelect: "लिंग चुनें",
        male: "पुरुष",
        female: "महिला",
        other: "अन्य",
        messagePlaceholder: "अपना संदेश टाइप करें..."
    },
    marathi: {
        welcome: "नमस्कार! मी डॉ. आरोग्य आहे, तुमचा वैयक्तिक आरोग्य साथी। आज मी तुमची कशी मदत करू शकतो?",
        infoTitle: "मला तुमच्याबद्दल सांगा",
        continueBtn: "पुढे चला",
        reportBtn: "आरोग्य अहवाल तयार करा",
        newConsultBtn: "नवीन सल्ला",
        disclaimer: "🔒 अस्वीकरण: डॉ. आरोग्य हा परवानाधारक डॉक्टर नाही. गंभीर परिस्थितीसाठी नेहमी आरोग्य व्यावसायिकाचा सल्ला घ्या.",
        loading: "डॉ. आरोग्य विचार करत आहेत...",
        emergency: "ही आपत्कालीन स्थिती असू शकते. कृपया तातडीने वैद्यकीय मदत घ्या किंवा जवळच्या रुग्णालयात जा.",
        languageLabel: "भाषा निवडा:",
        namePlaceholder: "तुमचे नाव",
        agePlaceholder: "वय",
        cityPlaceholder: "शहर",
        genderSelect: "लिंग निवडा",
        male: "पुरुष",
        female: "स्त्री",
        other: "इतर",
        messagePlaceholder: "तुमचा संदेश टाइप करा..."
    },
    kannada: {
        welcome: "ನಮಸ್ಕಾರ! ನಾನು ಡಾ. ಆರೋಗ್ಯ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಸಹಚರ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        infoTitle: "ನಿಮ್ಮ ಬಗ್ಗೆ ತಿಳಿಸಿ",
        continueBtn: "ಮುಂದುವರಿಸಿ",
        reportBtn: "ಆರೋಗ್ಯ ವರದಿ ರಚಿಸಿ",
        newConsultBtn: "ಹೊಸ ಸಲಹೆ",
        disclaimer: "🔒 ಹಕ್ಕು ನಿರಾಕರಣೆ: ಡಾ. ಆರೋಗ್ಯ ಪರವಾನಗಿ ಪಡೆದ ವೈದ್ಯರಲ್ಲ. ಗಂಭೀರ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಯಾವಾಗಲೂ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        loading: "ಡಾ. ಆರೋಗ್ಯ ಯೋಚಿಸುತ್ತಿದ್ದಾರೆ...",
        emergency: "ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.",
        languageLabel: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ:",
        namePlaceholder: "ನಿಮ್ಮ ಹೆಸರು",
        agePlaceholder: "ವಯಸ್ಸು",
        cityPlaceholder: "ನಗರ",
        genderSelect: "ಲಿಂಗ ಆಯ್ಕೆಮಾಡಿ",
        male: "ಪುರುಷ",
        female: "ಮಹಿಳೆ",
        other: "ಇತರೆ",
        messagePlaceholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..."
    }
};

// Emergency Keywords
const emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'loss of consciousness', 'seizure', 'excessive bleeding',
    'heart attack', 'stroke', 'unconscious', 'severe pain', 'can\'t breathe',
    'सीने में दर्द', 'सांस लेने में कठिनाई', 'बेहोशी', 'दौरा', 'अधिक खून बहना',
    'छातीत दुखणे', 'श्वास घेण्यात अडचण', 'बेशुद्धी', 'फिट', 'जास्त रक्तस्राव',
    'ಎದೆ ನೋವು', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಪ್ರಜ್ಞೆ ಕಳೆದುಕೊಳ್ಳುವುದು', 'ಸೆಳೆತ', 'ಅಧಿಕ ರಕ್ತಸ್ರಾವ'
];

// AI-Driven Questioning System
let questionCount = 0;
let maxQuestions = 6; // Maximum questions before moving to recommendation
let minQuestions = 3; // Minimum questions before AI can decide to move to recommendation
let questionsAsked = 0; // Track actual questions asked

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        // Handle initialization errors silently in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error initializing Arogya AI:', error);
        }
    }
});

function initializeApp() {
    try {
        updateLanguageElements();
        showUserInfoSection();

        // Event listeners with error handling
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const languageSelect = document.getElementById('language');
        const reportModal = document.getElementById('reportPreviewModal');

        if (messageInput) {
            messageInput.addEventListener('keypress', handleKeyPress);
        }

        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }

        if (languageSelect) {
            languageSelect.addEventListener('change', changeLanguage);
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Add click outside modal to close
        if (reportModal) {
            reportModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeReportPreview();
                }
            });
        }
    } catch (error) {
        // Handle errors silently in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error in initializeApp:', error);
        }
    }
}

function handleKeyboardShortcuts(event) {
    // Close modal with Escape key
    if (event.key === 'Escape') {
        const modal = document.getElementById('reportPreviewModal');
        if (modal && modal.style.display === 'flex') {
            closeReportPreview();
        }
    }
}

function updateLanguageElements() {
    try {
        const lang = translations[currentLanguage];
        if (!lang) {
            return;
        }

        // Update text elements
        const elements = [
            { id: 'welcomeMessage', property: 'textContent', value: lang.welcome },
            { id: 'infoTitle', property: 'textContent', value: lang.infoTitle },
            { id: 'continueBtn', property: 'textContent', value: lang.continueBtn },
            { id: 'reportBtnText', property: 'textContent', value: lang.reportBtn },
            { id: 'newConsultBtnText', property: 'textContent', value: lang.newConsultBtn },
            { id: 'disclaimerText', property: 'innerHTML', value: lang.disclaimer },
            { id: 'loadingText', property: 'textContent', value: lang.loading },
            { id: 'emergencyText', property: 'textContent', value: lang.emergency },
            { id: 'languageLabel', property: 'textContent', value: lang.languageLabel }
        ];

        elements.forEach(({ id, property, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element[property] = value;
            }
        });

        // Update placeholders
        const placeholders = [
            { id: 'userName', value: lang.namePlaceholder },
            { id: 'userAge', value: lang.agePlaceholder },
            { id: 'userCity', value: lang.cityPlaceholder },
            { id: 'messageInput', value: lang.messagePlaceholder }
        ];

        placeholders.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element.placeholder = value;
            }
        });

        // Update gender options
        const genderSelect = document.getElementById('userGender');
        if (genderSelect) {
            genderSelect.innerHTML = `
                <option value="">${lang.genderSelect}</option>
                <option value="male">${lang.male}</option>
                <option value="female">${lang.female}</option>
                <option value="other">${lang.other}</option>
            `;
        }
    } catch (error) {
        // Handle errors silently in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error updating language elements:', error);
        }
    }
}

function changeLanguage() {
    currentLanguage = document.getElementById('language').value;
    updateLanguageElements();
}

function showUserInfoSection() {
    const userInfoSection = document.getElementById('userInfoSection');
    if (userInfoSection) {
        userInfoSection.style.display = 'block';
        consultationPhase = 'info_collection';
    }
}

function saveUserInfo() {
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value;
    const gender = document.getElementById('userGender').value;
    const city = document.getElementById('userCity').value.trim();

    if (!name || !age || !gender || !city) {
        alert('Please fill in all fields');
        return;
    }

    userInfo = { name, age, gender, city };
    document.getElementById('userInfoSection').style.display = 'none';

    // Start symptom collection phase
    startSymptomCollection();
}

function startSymptomCollection() {
    questionCount = 0;
    questionsAsked = 0;
    isDataCollectionComplete = false;
    consultationPhase = 'symptom_collection';

    // Start with structured introduction
    const introMessage = currentLanguage === 'hindi' ?
        `धन्यवाद ${userInfo.name}। मैंने नोट किया है कि आप ${userInfo.city} के ${userInfo.age} वर्षीय ${userInfo.gender === 'male' ? 'पुरुष' : 'महिला'} हैं।

आज आपके स्वास्थ्य सेवा प्रदाता के रूप में, मुझे आपके लक्षणों को विस्तार से समझना होगा। कृपया बताएं कि आपको क्या परेशान कर रहा है, जिसमें शामिल है:
- आपके लक्षण कब शुरू हुए?
- वे कितने गंभीर हैं?
- कोई विशिष्ट ट्रिगर जिन्हें आपने देखा है?
- कोई पिछली चिकित्सा स्थितियां?

यह मुझे आपको सबसे सटीक मूल्यांकन प्रदान करने में मदद करेगा।` :
        currentLanguage === 'marathi' ?
        `धन्यवाद ${userInfo.name}। मी नोंदवले आहे की तुम्ही ${userInfo.city} चे ${userInfo.age} वर्षीय ${userInfo.gender === 'male' ? 'पुरुष' : 'महिला'} आहात।

आज तुमचा आरोग्य सेवा प्रदाता म्हणून, मला तुमची लक्षणे तपशीलवार समजून घेणे आवश्यक आहे। कृपया सांगा की तुम्हाला काय त्रास होत आहे, ज्यामध्ये हे समाविष्ट आहे:
- तुमची लक्षणे कधी सुरू झाली?
- ती किती गंभीर आहेत?
- तुम्ही लक्षात घेतलेले कोणतेही विशिष्ट ट्रिगर?
- कोणत्याही पूर्वीच्या वैद्यकीय स्थिती?

हे मला तुम्हाला सर्वात अचूक मूल्यांकन प्रदान करण्यात मदत करेल।` :
        currentLanguage === 'kannada' ?
        `ಧನ್ಯವಾದಗಳು ${userInfo.name}। ನೀವು ${userInfo.city} ನ ${userInfo.age} ವರ್ಷದ ${userInfo.gender === 'male' ? 'ಪುರುಷ' : 'ಮಹಿಳೆ'} ಎಂದು ನಾನು ಗಮನಿಸಿದ್ದೇನೆ।

ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸೇವಾ ಪೂರೈಕೆದಾರನಾಗಿ, ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬೇಕಾಗಿದೆ। ನಿಮ್ಮನ್ನು ಏನು ತೊಂದರೆಗೊಳಿಸುತ್ತಿದೆ ಎಂಬುದನ್ನು ದಯವಿಟ್ಟು ವಿವರಿಸಿ, ಇದರಲ್ಲಿ ಸೇರಿದೆ:
- ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಯಾವಾಗ ಪ್ರಾರಂಭವಾದವು?
- ಅವು ಎಷ್ಟು ತೀವ್ರವಾಗಿವೆ?
- ನೀವು ಗಮನಿಸಿದ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಪ್ರಚೋದಕಗಳು?
- ಯಾವುದೇ ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿಗಳು?

ಇದು ನಿಮಗೆ ಅತ್ಯಂತ ನಿಖರವಾದ ಮೌಲ್ಯಮಾಪನವನ್ನು ಒದಗಿಸಲು ನನಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ।` :
        `Thank you ${userInfo.name}. I've noted that you're a ${userInfo.age}-year-old ${userInfo.gender} from ${userInfo.city}.

As your health care provider today, I'll need to understand your symptoms in detail. Please describe what's bothering you, including:
- When did your symptoms start?
- How severe are they?
- Any specific triggers you've noticed?
- Any previous medical conditions?

This will help me provide you with the most accurate assessment.`;

    addMessage(introMessage, 'ai');
}

// Multi-Model AI Wrapper Function
async function callAIModel(prompt, systemPrompt, isQuestion = false) {
    currentModelIndex = 0; // Reset to primary model

    for (let i = 0; i < AI_MODELS.length; i++) {
        const model = AI_MODELS[currentModelIndex];
        console.log(`Trying model ${model.name} (${model.provider})...`);

        try {
            let response;

            if (model.provider === 'groq') {
                response = await callGroqAPI(prompt, systemPrompt, model.model);
            } else if (model.provider === 'gemini') {
                response = await callGeminiAPI(prompt, systemPrompt);
            }

            if (response) {
                console.log(`Success with model: ${model.name}`);
                return response;
            }

        } catch (error) {
            console.error(`Model ${model.name} failed:`, error);
        }

        // Move to next model
        currentModelIndex = (currentModelIndex + 1) % AI_MODELS.length;

        // Add exponential backoff delay
        if (i < AI_MODELS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }

    // All models failed
    console.error('All AI models failed');
    return getFallbackResponse(isQuestion);
}

async function askAIQuestion() {


    // Check if we should move to recommendation phase
    if (questionsAsked >= maxQuestions || (questionsAsked >= minQuestions && isDataCollectionComplete)) {
        moveToRecommendationPhase();
        return;
    }

    // Generate AI question based on conversation history
    const questionPrompt = createQuestionPrompt();
    const systemPrompt = createQuestionSystemPrompt();

    try {
        showLoading(true);
        const aiResponse = await callAIModel(questionPrompt, systemPrompt, true);

        // Check if AI indicates data collection is complete
        if (questionsAsked >= minQuestions && aiResponse.toLowerCase().includes('enough information')) {
            isDataCollectionComplete = true;
            moveToRecommendationPhase();
            return;
        }

        setTimeout(() => {
            addMessage(aiResponse, 'ai');
            storeAIQuestion(aiResponse);
            questionsAsked++;
            showLoading(false);
        }, 500);

    } catch (error) {
        console.error('Error generating AI question:', error);
        showLoading(false);

        // Fallback to basic question
        const fallbackQuestion = getFallbackQuestion();
        addMessage(fallbackQuestion, 'ai');
        storeAIQuestion(fallbackQuestion);
        questionsAsked++;
    }
}

function moveToRecommendationPhase() {

    consultationPhase = 'recommendation';

    const processingMessage = currentLanguage === 'hindi' ?
        `धन्यवाद ${userInfo.name}! अब मैं आपकी जानकारी का विश्लेषण कर रहा हूं...` :
        currentLanguage === 'marathi' ?
        `धन्यवाद ${userInfo.name}! आता मी तुमच्या माहितीचे विश्लेषण करत आहे...` :
        currentLanguage === 'kannada' ?
        `ಧನ್ಯವಾದಗಳು ${userInfo.name}! ಈಗ ನಾನು ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ...` :
        `Thank you ${userInfo.name}! Now I'm analyzing your information...`;

    addMessage(processingMessage, 'ai');

    setTimeout(() => {
        generateRecommendation();
    }, 2000);
}

function getFallbackQuestion() {
    const fallbackQuestions = {
        english: `${userInfo.name}, could you tell me more about how you're feeling?`,
        hindi: `${userInfo.name}, कृपया बताएं कि आप कैसा महसूस कर रहे हैं?`,
        marathi: `${userInfo.name}, कृपया सांगा की तुम्ही कसे वाटत आहात?`,
        kannada: `${userInfo.name}, ದಯವಿಟ್ಟು ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ ಎಂದು ಹೇಳಿ?`
    };
    return fallbackQuestions[currentLanguage] || fallbackQuestions.english;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // Check for emergency
    if (checkEmergency(message)) {
        showEmergencyAlert();
        return;
    }

    addMessage(message, 'user');
    input.value = '';

    // Handle different consultation phases
    if (consultationPhase === 'symptom_collection') {
        storeSymptomAnswer(message);
        questionCount++;

        // Small delay before next question
        setTimeout(() => {
            askAIQuestion();
        }, 1000);

    } else if (consultationPhase === 'pdf_question') {
        const lowerMessage = message.toLowerCase();
        const isYes = lowerMessage.includes('yes') || lowerMessage.includes('हाँ') ||
                     lowerMessage.includes('होय') || lowerMessage.includes('ಹೌದು') ||
                     lowerMessage.includes('y') || lowerMessage.includes('हा');

        if (isYes) {
            // Generate PDF report
            setTimeout(() => {
                generateReport();
            }, 500);
        } else {
            // Show action buttons for new consultation
            const thankYouMessage = currentLanguage === 'hindi' ?
                "धन्यवाद! यदि आपको कोई और सहायता चाहिए तो कृपया नई सलाह शुरू करें।" :
                currentLanguage === 'marathi' ?
                "धन्यवाद! तुम्हाला आणखी काही मदत हवी असल्यास कृपया नवीन सल्ला सुरू करा." :
                currentLanguage === 'kannada' ?
                "ಧನ್ಯವಾದಗಳು! ನಿಮಗೆ ಹೆಚ್ಚಿನ ಸಹಾಯ ಬೇಕಾದರೆ ದಯವಿಟ್ಟು ಹೊಸ ಸಲಹೆ ಪ್ರಾರಂಭಿಸಿ." :
                "Thank you! If you need any more assistance, please start a new consultation.";

            addMessage(thankYouMessage, 'ai');
            document.getElementById('actionButtons').style.display = 'flex';
        }
        consultationPhase = 'completed';
    }
}

function storeSymptomAnswer(answer) {
    const questionKey = `question_${questionCount}`;
    collectedSymptoms[questionKey] = answer;

    // Store with the last AI question
    if (conversationHistory.length > 0) {
        const lastEntry = conversationHistory[conversationHistory.length - 1];
        if (!lastEntry.answer) {
            lastEntry.answer = answer;
        } else {
            conversationHistory.push({
                question: "Follow-up response",
                answer: answer
            });
        }
    } else {
        conversationHistory.push({
            question: "Initial response",
            answer: answer
        });
    }

    questionCount++;
}

// Create AI question prompt based on conversation history
function createQuestionPrompt() {
    let prompt = `Patient Information:
Name: ${userInfo.name}
Age: ${userInfo.age}
Gender: ${userInfo.gender}
City: ${userInfo.city}

Conversation History:
`;

    conversationHistory.forEach((item, index) => {
        prompt += `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}\n\n`;
    });

    prompt += `
Based on the conversation so far, generate the next logical follow-up question to understand the patient's health condition better.

Guidelines:
- Ask only ONE question at a time
- Keep it conversational and empathetic
- Focus on understanding symptoms, duration, severity, triggers, or related health information
- Avoid repetitive questions
- If you have enough information for a preliminary assessment, indicate that you're ready to provide guidance
- Respond in ${currentLanguage}

Generate the next question:`;

    return prompt;
}

// Create system prompt for AI questioning
function createQuestionSystemPrompt() {
    return `🔁 PHASE 1: SYMPTOM COLLECTION & FOLLOW-UP

You are Dr. Arogya, a compassionate AI health assistant. You are currently in the symptom collection phase.

Your job is to ask follow-up questions ONLY. Do not give advice or recommendations at this stage.

CONVERSATION STYLE EXAMPLES:
- "Sorry to hear that you're not feeling well. 🤕"
- "Let's try to understand your symptoms better. Can you please tell me more about your headache? Is it a dull ache or a sharp pain? Is it located on one side of your head or all over?"
- "So you've had a dull headache for 3 days. That can be really uncomfortable. 🤕"
- "That's a good detail to know."
- "That's great to hear! Having a good daily routine can really help in maintaining overall health and well-being."

STRICT RULES FOR PHASE 1:
- Don't give suggestions or advice
- Don't say "Based on your symptoms..."
- Use empathetic responses like "Sorry to hear that" or "That can be really uncomfortable"
- Ask 1-2 focused questions at a time
- Use emojis sparingly (🤕 for sympathy)
- Acknowledge their answers before asking next question
- Respond ONLY in ${currentLanguage === 'english' ? 'English' : currentLanguage === 'hindi' ? 'Hindi' : currentLanguage === 'marathi' ? 'Marathi' : 'Kannada'}

If you have collected enough information after ${minQuestions} questions, you can respond with "I think I've got enough information" to proceed to recommendations.

Focus on gathering:
- Symptom details (what, when, how long, severity)
- Associated symptoms (fever, body ache, etc.)
- Daily routine and lifestyle factors
- Medical history and current medications
- Triggers or patterns`;
}

function checkEmergency(message) {
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

function showEmergencyAlert() {
    document.getElementById('emergencyAlert').style.display = 'block';
    setTimeout(() => {
        document.getElementById('emergencyAlert').style.display = 'none';
    }, 10000);
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${sender === 'ai' ? 'fa-user-md' : 'fa-user'}"></i>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Individual API call functions
async function callGroqAPI(prompt, systemPrompt, model) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEYS.GROQ}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    });

    if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
    } else {
        throw new Error('Invalid response format from GROQ API');
    }
}

async function callGeminiAPI(prompt, systemPrompt) {
    const combinedPrompt = `${systemPrompt}\n\n${prompt}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.GEMINI}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: combinedPrompt
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0 &&
        data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Invalid response format from Gemini API');
    }
}

function getFallbackResponse(isQuestion = false) {
    if (isQuestion) {
        const fallbackQuestions = {
            english: "Can you tell me more about how you're feeling?",
            hindi: "कृपया बताएं कि आप कैसा महसूस कर रहे हैं?",
            marathi: "कृपया सांगा की तुम्ही कसे वाटत आहात?",
            kannada: "ದಯವಿಟ್ಟು ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ ಎಂದು ಹೇಳಿ?"
        };
        return fallbackQuestions[currentLanguage] || fallbackQuestions.english;
    } else {
        return getFallbackGuidance();
    }
}

async function generateRecommendation() {
    showLoading(true);

    try {
        const recommendation = await getAIRecommendation();
        aiGuidanceResponse = recommendation; // Store for report generation
        addMessage(recommendation, 'ai');

        // Ask if user wants PDF report
        setTimeout(() => {
            const pdfQuestion = currentLanguage === 'hindi' ?
                `${userInfo.name}, क्या आप एक विस्तृत स्वास्थ्य रिपोर्ट चाहते हैं? (हाँ/नहीं)` :
                currentLanguage === 'marathi' ?
                `${userInfo.name}, तुम्हाला तपशीलवार आरोग्य अहवाल हवा आहे का? (होय/नाही)` :
                currentLanguage === 'kannada' ?
                `${userInfo.name}, ನಿಮಗೆ ವಿವರವಾದ ಆರೋಗ್ಯ ವರದಿ ಬೇಕೇ? (ಹೌದು/ಇಲ್ಲ)` :
                `${userInfo.name}, would you like me to generate a detailed health report for you? (Yes/No)`;

            addMessage(pdfQuestion, 'ai');
            consultationPhase = 'pdf_question';
        }, 2000);

    } catch (error) {
        console.error('Error generating recommendation:', error);
        const errorMessage = 'I\'m facing technical issues. Please try again shortly.';
        addMessage(errorMessage, 'ai');
    } finally {
        showLoading(false);
    }
}

async function getAIRecommendation() {
    const prompt = createRecommendationPrompt();
    const systemPrompt = createRecommendationSystemPrompt();

    try {
        return await callAIModel(prompt, systemPrompt, false);
    } catch (error) {
        console.error('Error getting AI recommendation:', error);
        return getFallbackRecommendation();
    }
}

function createRecommendationSystemPrompt() {
    return `✅ PHASE 2: COMPLETE RECOMMENDATION PHASE

You are Dr. Arogya, a culturally-aware, compassionate AI health assistant for Indian users following WHO, ICMR, MoHFW, and CDC guidelines.

Now that you've gathered enough symptom information, begin generating structured guidance. This is not a diagnosis.

IMPORTANT: Respond ONLY in ${currentLanguage === 'english' ? 'English' : currentLanguage === 'hindi' ? 'Hindi' : currentLanguage === 'marathi' ? 'Marathi' : 'Kannada'}. Do not mix languages.

EXACT FORMAT TO FOLLOW:

Start with: "I think I've got a good understanding of your symptoms now. Let me summarize everything to make sure I've got it right."

🧾 Symptom Summary
[Summarize what the user described in 2-3 lines]

Let me provide some guidance based on your symptoms.

🧠 Clinical Assessment
This might be related to [condition], but it's not a medical diagnosis.

🧘 Lifestyle Guidance
Try to rest, hydrate, and monitor your symptoms. [Add specific advice]

🌿 दादी माँ के नुस्खे (Traditional Remedies)
You can try these traditional remedies:
1. [First traditional remedy with detailed usage instructions]
2. [Second traditional remedy with detailed usage instructions]

📅 Medical Recommendations
If your symptoms worsen or last beyond [timeframe], please consult a certified doctor for further evaluation and guidance.

🔒 Medical Disclaimer
This is not a replacement for a licensed medical opinion. Always consult a real doctor for serious or persistent conditions.

Please let me know if you have any further questions or concerns!

DO NOT use ** or * formatting. Use clean section headers with emojis only.
Be warm, empathetic, and culturally sensitive.

IMPORTANT: Always include MINIMUM 2 traditional remedies in the "🌿 दादी माँ के नुस्खे" section with detailed usage instructions.`;
}

// Store AI question in conversation history
function storeAIQuestion(question) {
    conversationHistory.push({
        question: question,
        answer: null // Will be filled when user responds
    });
}

function createRecommendationPrompt() {
    let prompt = `Patient Information:
Name: ${userInfo.name}
Age: ${userInfo.age}
Gender: ${userInfo.gender}
City: ${userInfo.city}

Detailed Consultation History:
`;

    conversationHistory.forEach((item, index) => {
        if (item.answer) {
            prompt += `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}\n\n`;
        }
    });

    prompt += `
Based on this detailed consultation, provide structured health recommendations following the exact format specified.

Consider the patient's:
- Reported symptoms and their characteristics
- Duration and severity of symptoms
- Associated factors and triggers
- Medical history and current medications
- Age, gender, and location for cultural context

Provide practical, culturally appropriate advice including traditional Indian remedies that are safe and commonly used.

Remember: This is preliminary guidance only, not a medical diagnosis.`;

    return prompt;
}

function getFallbackRecommendation() {
    console.log('Using fallback recommendation due to API failure');

    const fallbacks = {
        english: `I think I've got a good understanding of your symptoms now. Let me summarize everything to make sure I've got it right.

🧾 Symptom Summary
Based on what you've shared, I understand you're experiencing some health concerns that are affecting your daily life.

Let me provide some guidance based on your symptoms.

🧠 Clinical Assessment
This might be related to common conditions like stress, fatigue, or minor infections, but it's not a medical diagnosis.

🧘 Lifestyle Guidance
Try to rest, hydrate, and monitor your symptoms. Get adequate sleep and eat light, nutritious meals.

🌿 दादी माँ के नुस्खे (Traditional Remedies)
1. Ginger tea with honey: Boil fresh ginger in water for 5 minutes, strain, and add honey when warm. Drink 2-3 times daily.
2. Turmeric milk: Add a pinch of turmeric to warm milk before bed. This helps with inflammation and promotes better sleep.

📅 Medical Recommendations
If your symptoms worsen or last beyond 2-3 days, please consult a certified doctor for further evaluation and guidance.

🔒 Medical Disclaimer
This is not a replacement for a licensed medical opinion. Always consult a real doctor for serious or persistent conditions.

Please let me know if you have any further questions or concerns!`,

        hindi: `मुझे लगता है कि अब मुझे आपके लक्षणों की अच्छी समझ मिल गई है। मैं सब कुछ संक्षेप में बताता हूं ताकि यह सुनिश्चित हो सके कि मैंने सही समझा है।

🧾 लक्षण सारांश
आपने जो बताया है, उसके आधार पर मैं समझता हूं कि आपको कुछ स्वास्थ्य संबंधी समस्याएं हैं।

आपके लक्षणों के आधार पर मैं कुछ मार्गदर्शन प्रदान करता हूं।

🧠 नैदानिक मूल्यांकन
यह तनाव, थकान, या मामूली संक्रमण से संबंधित हो सकता है, लेकिन यह चिकित्सा निदान नहीं है।

🧘 जीवनशैली मार्गदर्शन
आराम करने, हाइड्रेटेड रहने और अपने लक्षणों पर नज़र रखने की कोशिश करें। पर्याप्त नींद लें और हल्का, पौष्टिक भोजन करें।

🌿 दादी माँ के नुस्खे (पारंपरिक उपचार)
1. अदरक की चाय शहद के साथ: ताजा अदरक को 5 मिनट तक पानी में उबालें, छान लें और गर्म होने पर शहद मिलाएं। दिन में 2-3 बार पिएं।
2. हल्दी दूध: सोने से पहले गर्म दूध में एक चुटकी हल्दी मिलाएं। यह सूजन में मदद करता है और बेहतर नींद को बढ़ावा देता है।

📅 चिकित्सा सिफारिशें
यदि आपके लक्षण 2-3 दिनों से अधिक बिगड़ते हैं या बने रहते हैं, तो कृपया आगे के मूल्यांकन और मार्गदर्शन के लिए एक प्रमाणित डॉक्टर से सलाह लें।

🔒 चिकित्सा अस्वीकरण
यह लाइसेंसी चिकित्सा राय का विकल्प नहीं है। गंभीर या लगातार स्थितियों के लिए हमेशा एक वास्तविक डॉक्टर से सलाह लें।

कृपया मुझे बताएं कि क्या आपके कोई और प्रश्न या चिंताएं हैं!`,

        marathi: `मला वाटते की आता मला तुमच्या लक्षणांची चांगली समज मिळाली आहे. मी सर्वकाही सारांशित करतो याची खात्री करण्यासाठी की मला ते योग्य समजले आहे.

🧾 लक्षण सारांश
तुम्ही जे सांगितले त्यावरून मला समजते की तुम्हाला काही आरोग्य संबंधी समस्या आहेत।

तुमच्या लक्षणांच्या आधारे मी काही मार्गदर्शन देतो.

🧠 नैदानिक मूल्यांकन
हे तणाव, थकवा किंवा किरकोळ संसर्गाशी संबंधित असू शकते, परंतु हे वैद्यकीय निदान नाही।

🧘 जीवनशैली मार्गदर्शन
विश्रांती घेण्याचा, हायड्रेटेड राहण्याचा आणि तुमच्या लक्षणांवर लक्ष ठेवण्याचा प्रयत्न करा। पुरेशी झोप घ्या आणि हलके, पौष्टिक जेवण करा।

🌿 दादी माँ के नुस्खे (पारंपारिक उपचार)
1. आले चहा मधासह: ताजे आले 5 मिनिटे पाण्यात उकळवा, गाळून घ्या आणि गरम असताना मध घाला. दिवसातून 2-3 वेळा प्या.
2. हळद दूध: झोपण्यापूर्वी गरम दुधात चिमूटभर हळद घाला. हे जळजळ कमी करण्यास मदत करते आणि चांगली झोप येते.

📅 वैद्यकीय शिफारसी
जर तुमची लक्षणे 2-3 दिवसांपेक्षा जास्त वाढली किंवा राहिली तर कृपया पुढील मूल्यांकन आणि मार्गदर्शनासाठी प्रमाणित डॉक्टरांचा सल्ला घ्या।

🔒 वैद्यकीय अस्वीकरण
हे परवानाधारक वैद्यकीय मताचा पर्याय नाही। गंभीर किंवा सतत परिस्थितीसाठी नेहमी खऱ्या डॉक्टरांचा सल्ला घ्या।

कृपया मला कळवा की तुमचे आणखी काही प्रश्न किंवा चिंता आहेत का!`,

        kannada: `ನಾನು ಈಗ ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಬಗ್ಗೆ ಉತ್ತಮ ತಿಳುವಳಿಕೆಯನ್ನು ಪಡೆದಿದ್ದೇನೆ ಎಂದು ನಾನು ಭಾವಿಸುತ್ತೇನೆ. ನಾನು ಅದನ್ನು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ನಾನು ಎಲ್ಲವನ್ನೂ ಸಾರಾಂಶಗೊಳಿಸುತ್ತೇನೆ.

🧾 ಲಕ್ಷಣ ಸಾರಾಂಶ
ನೀವು ಹಂಚಿಕೊಂಡಿರುವ ಆಧಾರದ ಮೇಲೆ, ನಿಮಗೆ ಕೆಲವು ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿವೆ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.

ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ನಾನು ಕೆಲವು ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತೇನೆ.

🧠 ಕ್ಲಿನಿಕಲ್ ಮೌಲ್ಯಮಾಪನ
ಇದು ಒತ್ತಡ, ಆಯಾಸ ಅಥವಾ ಸಣ್ಣ ಸೋಂಕುಗಳಿಗೆ ಸಂಬಂಧಿಸಿರಬಹುದು, ಆದರೆ ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.

🧘 ಜೀವನಶೈಲಿ ಮಾರ್ಗದರ್ಶನ
ವಿಶ್ರಾಂತಿ ಪಡೆಯಲು, ಹೈಡ್ರೇಟೆಡ್ ಆಗಿರಲು ಮತ್ತು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ. ಸಾಕಷ್ಟು ನಿದ್ರೆ ಪಡೆಯಿರಿ ಮತ್ತು ಹಗುರವಾದ, ಪೌಷ್ಟಿಕ ಆಹಾರವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.

🌿 दादी माँ के नुस्खे (ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಹಾರಗಳು)
1. ಶುಂಠಿ ಚಹಾ ಜೇನುತುಪ್ಪದೊಂದಿಗೆ: ತಾಜಾ ಶುಂಠಿಯನ್ನು 5 ನಿಮಿಷಗಳ ಕಾಲ ನೀರಿನಲ್ಲಿ ಕುದಿಸಿ, ಶೋಧಿಸಿ ಮತ್ತು ಬೆಚ್ಚಗಿರುವಾಗ ಜೇನುತುಪ್ಪ ಸೇರಿಸಿ. ದಿನಕ್ಕೆ 2-3 ಬಾರಿ ಕುಡಿಯಿರಿ.
2. ಅರಿಶಿನ ಹಾಲು: ಮಲಗುವ ಮೊದಲು ಬೆಚ್ಚಗಿನ ಹಾಲಿಗೆ ಚಿಟಿಕೆ ಅರಿಶಿನ ಸೇರಿಸಿ. ಇದು ಉರಿಯೂತವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಉತ್ತಮ ನಿದ್ರೆಯನ್ನು ಉತ್ತೇಜಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.

📅 ವೈದ್ಯಕೀಯ ಶಿಫಾರಸುಗಳು
ನಿಮ್ಮ ಲಕ್ಷಣಗಳು 2-3 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಹದಗೆಟ್ಟರೆ ಅಥವಾ ಇದ್ದರೆ, ದಯವಿಟ್ಟು ಮುಂದಿನ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಪ್ರಮಾಣಿತ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.

🔒 ವೈದ್ಯಕೀಯ ಹಕ್ಕು ನಿರಾಕರಣೆ
ಇದು ಪರವಾನಗಿ ಪಡೆದ ವೈದ್ಯಕೀಯ ಅಭಿಪ್ರಾಯದ ಬದಲಿಯಲ್ಲ. ಗಂಭೀರ ಅಥವಾ ನಿರಂತರ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಯಾವಾಗಲೂ ನಿಜವಾದ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.

ನಿಮಗೆ ಯಾವುದೇ ಹೆಚ್ಚಿನ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಕಾಳಜಿಗಳಿದ್ದರೆ ದಯವಿಟ್ಟು ನನಗೆ ತಿಳಿಸಿ!`
    };

    return fallbacks[currentLanguage] || fallbacks.english;
}

function getFallbackGuidance() {
    console.log('Using fallback guidance due to API failure');

    const fallbacks = {
        english: `🧾 **Symptom Summary**
Based on what you've shared, I understand you're experiencing some health concerns.

🧠 **Possible Non-Diagnostic Explanation**
This might be related to common conditions like stress, fatigue, or minor infections, but this is not a medical diagnosis.

🧘 **Lifestyle Guidance**
Try to rest, stay hydrated, and monitor your symptoms. Avoid spicy food and get adequate sleep.

🌿 **दादी माँ का नुस्खा (Traditional Remedies)**
1. Ginger tea with honey - Boil fresh ginger in water, add honey when warm
2. Turmeric milk - Add a pinch of turmeric to warm milk before bed

📅 **When to See a Doctor**
If symptoms persist beyond 2-3 days or worsen, please consult a certified doctor.

🔒 **Safety Disclaimer**
This is not a replacement for licensed medical opinion. Always consult a real doctor for serious or persistent conditions.`,

        hindi: `🧾 **लक्षण सारांश**
आपने जो बताया है, उसके आधार पर मैं समझता हूं कि आपको कुछ स्वास्थ्य संबंधी चिंताएं हैं।

🧠 **संभावित गैर-निदान व्याख्या**
यह तनाव, थकान, या मामूली संक्रमण से संबंधित हो सकता है, लेकिन यह चिकित्सा निदान नहीं है।

🧘 **जीवनशैली मार्गदर्शन**
आराम करने, हाइड्रेटेड रहने और अपने लक्षणों पर नज़र रखने की कोशिश करें।

🌿 **दादी माँ का नुस्खा**
1. अदरक की चाय शहद के साथ - ताजा अदरक को पानी में उबालें, गर्म होने पर शहद मिलाएं
2. हल्दी दूध - सोने से पहले गर्म दूध में एक चुटकी हल्दी मिलाएं

📅 **डॉक्टर से कब मिलें**
यदि लक्षण 2-3 दिनों से अधिक बने रहते हैं या बिगड़ते हैं, तो कृपया डॉक्टर से सलाह लें।

🔒 **सुरक्षा अस्वीकरण**
यह लाइसेंसी चिकित्सा राय का विकल्प नहीं है। गंभीर स्थितियों के लिए हमेशा डॉक्टर से सलाह लें।`,

        marathi: `🧾 **लक्षण सारांश**
तुम्ही जे सांगितले त्यावरून मला समजते की तुम्हाला काही आरोग्य संबंधी चिंता आहेत।

🧠 **संभाव्य गैर-निदान स्पष्टीकरण**
हे तणाव, थकवा किंवा किरकोळ संसर्गाशी संबंधित असू शकते, परंतु हे वैद्यकीय निदान नाही।

🧘 **जीवनशैली मार्गदर्शन**
विश्रांती घ्या, हायड्रेटेड राहा आणि तुमच्या लक्षणांवर लक्ष ठेवा।

🌿 **दादी माँ का नुस्खा**
1. आले चहा मधासह - ताजे आले पाण्यात उकळवा, गरम झाल्यावर मध घाला
2. हळद दूध - झोपण्यापूर्वी गरम दुधात चिमूटभर हळद घाला

📅 **डॉक्टरांना कधी भेटावे**
जर लक्षणे 2-3 दिवसांपेक्षा जास्त राहिली किंवा वाढली तर कृपया डॉक्टरांचा सल्ला घ्या।

🔒 **सुरक्षा अस्वीकरण**
हे परवानाधारक वैद्यकीय सल्ल्याचा पर्याय नाही। गंभीर परिस्थितीसाठी नेहमी डॉक्टरांचा सल्ला घ्या।`,

        kannada: `🧾 **ಲಕ್ಷಣ ಸಾರಾಂಶ**
ನೀವು ಹಂಚಿಕೊಂಡಿರುವ ಆಧಾರದ ಮೇಲೆ, ನಿಮಗೆ ಕೆಲವು ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿವೆ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ।

🧠 **ಸಂಭವನೀಯ ಅಲ್ಲದ-ರೋಗನಿರ್ಣಯ ವಿವರಣೆ**
ಇದು ಒತ್ತಡ, ಆಯಾಸ ಅಥವಾ ಸಣ್ಣ ಸೋಂಕುಗಳಿಗೆ ಸಂಬಂಧಿಸಿರಬಹುದು, ಆದರೆ ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ।

🧘 **ಜೀವನಶೈಲಿ ಮಾರ್ಗದರ್ಶನ**
ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಹೈಡ್ರೇಟೆಡ್ ಆಗಿರಿ ಮತ್ತು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ।

🌿 **ದಾದಿ ಮಾಂ ಕಾ ನುಸ್ಖಾ**
1. ಶುಂಠಿ ಚಹಾ ಜೇನುತುಪ್ಪದೊಂದಿಗೆ - ತಾಜಾ ಶುಂಠಿಯನ್ನು ನೀರಿನಲ್ಲಿ ಕುದಿಸಿ, ಬೆಚ್ಚಗಾದಾಗ ಜೇನುತುಪ್ಪ ಸೇರಿಸಿ
2. ಅರಿಶಿನ ಹಾಲು - ಮಲಗುವ ಮೊದಲು ಬೆಚ್ಚಗಿನ ಹಾಲಿಗೆ ಚಿಟಿಕೆ ಅರಿಶಿನ ಸೇರಿಸಿ

📅 **ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಭೇಟಿಯಾಗಬೇಕು**
ಲಕ್ಷಣಗಳು 2-3 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇದ್ದರೆ ಅಥವಾ ಹದಗೆಟ್ಟರೆ, ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ।

🔒 **ಸುರಕ್ಷತಾ ಹಕ್ಕು ನಿರಾಕರಣೆ**
ಇದು ಪರವಾನಗಿ ಪಡೆದ ವೈದ್ಯಕೀಯ ಅಭಿಪ್ರಾಯದ ಬದಲಿಯಲ್ಲ। ಗಂಭೀರ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಯಾವಾಗಲೂ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ।`
    };

    return fallbacks[currentLanguage] || fallbacks.english;
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

async function generateReport() {
    showLoading(true);

    try {
        const reportData = prepareReportData();
        const aiAssessment = await getAIAssessmentForReport();
        await generatePDFReport(reportData, aiAssessment);
    } catch (error) {
        console.error('Error generating report:', error);
        const errorMessage = currentLanguage === 'hindi' ?
            'रिपोर्ट बनाने में त्रुटि। कृपया पुनः प्रयास करें।' :
            currentLanguage === 'marathi' ?
            'अहवाल तयार करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.' :
            currentLanguage === 'kannada' ?
            'ವರದಿ ರಚಿಸುವಲ್ಲಿ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' :
            'Error generating report. Please try again.';
        addMessage(errorMessage, 'ai');
    } finally {
        showLoading(false);
    }
}

function prepareReportData() {
    const now = new Date();
    const healthId = `AR-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Collect all consultation Q&A pairs
    const consultationData = conversationHistory.map((item, index) => ({
        questionNumber: index + 1,
        question: item.question,
        answer: item.answer || 'No response provided'
    }));

    // Extract key information from conversation history
    let symptoms = 'Not specified';
    let duration = 'Not specified';
    let severity = 'Not specified';
    let frequency = 'Not specified';
    let associated = 'None reported';
    let history = 'None reported';
    let medications = 'None reported';
    let allergies = 'None reported';
    let lifestyle = 'Not specified';
    let triggers = 'None identified';
    let previousTreatments = 'None reported';

    // Analyze conversation history to extract structured data
    conversationHistory.forEach((item, index) => {
        if (!item.answer) return;

        const question = item.question.toLowerCase();
        const answer = item.answer;

        // Identify main symptoms (usually first question)
        if (index === 0 || question.includes('symptom') || question.includes('problem') || question.includes('bothering')) {
            symptoms = answer;
        }

        // Duration patterns
        if (question.includes('when') || question.includes('how long') || question.includes('start') || question.includes('duration')) {
            duration = answer;
        }

        // Severity patterns
        if (question.includes('severe') || question.includes('pain') || question.includes('scale') || question.includes('bad')) {
            severity = answer;
        }

        // Frequency patterns
        if (question.includes('often') || question.includes('frequency') || question.includes('times')) {
            frequency = answer;
        }

        // Associated symptoms
        if (question.includes('other') || question.includes('associated') || question.includes('along') || question.includes('fever')) {
            associated = answer;
        }

        // Medical history
        if (question.includes('history') || question.includes('before') || question.includes('previous') || question.includes('past')) {
            history = answer;
        }

        // Medications
        if (question.includes('medication') || question.includes('medicine') || question.includes('taking') || question.includes('drug')) {
            medications = answer;
        }

        // Allergies
        if (question.includes('allerg') || answer.toLowerCase().includes('allerg')) {
            allergies = answer;
        }

        // Lifestyle
        if (question.includes('lifestyle') || question.includes('routine') || question.includes('sleep') || question.includes('exercise')) {
            lifestyle = answer;
        }

        // Triggers
        if (question.includes('trigger') || question.includes('cause') || question.includes('worse')) {
            triggers = answer;
        }

        // Previous treatments
        if (question.includes('treatment') || question.includes('tried') || question.includes('help')) {
            previousTreatments = answer;
        }
    });

    return {
        name: userInfo.name,
        age: userInfo.age,
        gender: userInfo.gender,
        location: userInfo.city,
        language: currentLanguage,
        date: now.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }),
        healthId: healthId,
        consultationData: consultationData,
        symptoms: symptoms,
        duration: duration,
        severity: severity,
        frequency: frequency,
        associated: associated,
        history: history,
        medications: medications,
        allergies: allergies,
        lifestyle: lifestyle,
        triggers: triggers,
        previousTreatments: previousTreatments,
        aiGuidance: aiGuidanceResponse || 'AI guidance not available'
    };
}

async function generatePDFReport(data, aiAssessment) {
    console.log('🔥🔥🔥 NEW FORMAT PDF GENERATION STARTING!');
    console.log('🔥 generatePDFReport called with:', data, aiAssessment);

    try {
        // Use the new format PDF generation ONLY
        if (typeof window.jspdf !== 'undefined' || typeof jsPDF !== 'undefined') {
            console.log('🔥 Calling generatePDFWithJsPDF with healthId:', data.healthId);
            generatePDFWithJsPDF(data.healthId);
        } else {
            console.log('🔥 jsPDF not available, using text fallback');
            // Fallback to text download with new format
            generateTextReportNewFormat(data.healthId);
        }

    } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to new format text report
        generateTextReportNewFormat(data.healthId);
    }
}

function generateTextReportNewFormat(healthId) {
    try {
        // Get current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) + ' IST';
        const reportHealthId = healthId || `AR-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;

        // Extract intelligent data from conversation
        const chiefComplaint = extractChiefComplaint();
        const duration = extractDuration();
        const severity = extractSeverity();
        const frequency = extractFrequency();
        const associatedSymptoms = extractAssociatedSymptoms();
        const medicalHistory = extractMedicalHistory();
        const currentMedications = extractCurrentMedications();
        const allergies = extractAllergies();
        const possibleCondition = extractPossibleCondition();
        const confidenceLevel = extractConfidenceLevel();
        const riskLevel = extractRiskLevel();
        const emergencyAlert = extractEmergencyAlert();
        const remedies = extractTraditionalRemedies();

        const patientName = userInfo.name || "_________________________";
        const patientLocation = userInfo.city || "____________________";

        const reportContent = `AROGYA AI - EARLY DIAGNOSTIC REPORT

Name: ${patientName}    Location: ${patientLocation}
Date: ${dateStr}    Time: ${timeStr}    Health ID: ${reportHealthId}

COLLECTED SYMPTOMS
- Chief Complaint: ${chiefComplaint}
- Duration: ${duration}    - Severity (1-10): ${severity}    - Frequency: ${frequency}
- Associated Symptoms: ${associatedSymptoms}
- Medical History: ${medicalHistory}
- Current Medications: ${currentMedications}
- Allergies: ${allergies}

AI PRELIMINARY ASSESSMENT
Possible Condition: ${possibleCondition}
AI Confidence Level: ${confidenceLevel}%    Risk Level: ${riskLevel}
Emergency Alert: ${emergencyAlert}

TRADITIONAL REMEDIES
1. Recommended Remedy: ${remedies.primary}
   Usage Instructions: ${remedies.primaryInstructions}
2. Alternative Remedy: ${remedies.alternative}
   Usage Instructions: ${remedies.alternativeInstructions}

DOCTOR ANALYSIS & DIAGNOSIS
Doctor Name: _________________________    License No: ____________________

Clinical Diagnosis: _____________________________________________________

Prescribed Medications:
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

-----------------------------------------------------_____________________________________________________________________________________

Additional Instructions/Follow-up:
_______________________________________________________________________
_______________________________________________________________________
Doctor Signature: _________________________    Date: _______________

Generated by Arogya AI v2.0 - For informational purposes only`;

        // Create and download text file
        const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Arogya_AI_Report_${reportHealthId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        const successMessage = currentLanguage === 'hindi' ?
            `✅ स्वास्थ्य रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!\n📄 फ़ाइल: Arogya_AI_Report_${reportHealthId}.txt` :
            currentLanguage === 'marathi' ?
            `✅ आरोग्य अहवाल यशस्वीरित्या डाउनलोड झाला!\n📄 फाइल: Arogya_AI_Report_${reportHealthId}.txt` :
            currentLanguage === 'kannada' ?
            `✅ ಆರೋಗ್ಯ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!\n📄 ಫೈಲ್: Arogya_AI_Report_${reportHealthId}.txt` :
            `✅ Health report downloaded successfully!\n📄 File: Arogya_AI_Report_${reportHealthId}.txt`;

        addMessage(successMessage, 'ai');

    } catch (error) {
        console.error('Error generating text report:', error);
        const errorMessage = currentLanguage === 'hindi' ?
            'रिपोर्ट बनाने में त्रुटि। कृपया पुनः प्रयास करें।' :
            'Error generating report. Please try again.';
        addMessage(errorMessage, 'ai');
    }
}

async function getAIAssessmentForReport() {
    const prompt = `Based on the consultation data, provide assessment in this format:

Possible Condition: [condition name]
AI Confidence Level: [percentage]%
Risk Level: [Low/Moderate/High]
Emergency Alert: [None/Monitor Closely/SEEK IMMEDIATE CARE]

Traditional Remedies:
1. Recommended Remedy: [remedy name]
   Usage Instructions: [instructions]
2. Alternative Remedy: [remedy name]
   Usage Instructions: [instructions]

Patient consultation data:
${conversationHistory.map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`).join('\n\n')}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.GROQ}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Dr. Arogya. Provide a concise medical assessment for a report. Be factual and include traditional remedies. Follow the exact format requested.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 800
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }
        }
    } catch (error) {
        console.error('Error getting AI assessment:', error);
    }

    return `Possible Condition: Based on reported symptoms
AI Confidence Level: Preliminary assessment only
Risk Level: Low/Moderate/High
Emergency Alert: None/Monitor Closely/Seek Immediate Care

Traditional Remedies:
1. Recommended Remedy: As discussed in consultation
   Usage Instructions: Follow traditional practices
2. Alternative Remedy: General wellness practices
   Usage Instructions: Maintain healthy lifestyle`;
}



// Helper functions to extract data from conversation
function extractChiefComplaint() {
    if (conversationHistory.length > 0) {
        const firstUserMessage = conversationHistory.find(msg => msg.type === 'user');
        return firstUserMessage ? firstUserMessage.message.substring(0, 50) + "..." : "Not specified";
    }
    return "Not specified";
}

function extractDuration() {
    const durationKeywords = ['day', 'week', 'month', 'year', 'hour', 'since', 'for'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of durationKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    const words = msg.message.split(' ');
                    const index = words.findIndex(word => word.toLowerCase().includes(keyword));
                    if (index > 0) return words[index - 1] + ' ' + words[index];
                }
            }
        }
    }
    return "Not specified";
}

function extractSeverity() {
    const severityPattern = /(\d+)(?:\s*(?:out of|\/)\s*10|\s*(?:scale|severity))/i;
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            const match = msg.message.match(severityPattern);
            if (match) return match[1] + "/10";
        }
    }
    return "Not rated";
}

function extractFrequency() {
    const frequencyKeywords = ['daily', 'weekly', 'hourly', 'constantly', 'occasionally', 'rarely', 'frequent'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of frequencyKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
                }
            }
        }
    }
    return "Not specified";
}

function extractAssociatedSymptoms() {
    const symptoms = [];
    const symptomKeywords = ['pain', 'fever', 'headache', 'nausea', 'fatigue', 'cough', 'cold', 'weakness'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of symptomKeywords) {
                if (msg.message.toLowerCase().includes(keyword) && !symptoms.includes(keyword)) {
                    symptoms.push(keyword);
                }
            }
        }
    }
    return symptoms.length > 0 ? symptoms.join(', ') : "None reported";
}

function extractMedicalHistory() {
    const historyKeywords = ['diabetes', 'hypertension', 'heart', 'surgery', 'allergy', 'medication', 'treatment'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of historyKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "Previous medical conditions mentioned";
                }
            }
        }
    }
    return "No significant history";
}

function extractCurrentMedications() {
    const medicationKeywords = ['taking', 'medicine', 'tablet', 'pill', 'drug', 'medication'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of medicationKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "Medications mentioned in consultation";
                }
            }
        }
    }
    return "None reported";
}

function extractAllergies() {
    const allergyKeywords = ['allergic', 'allergy', 'reaction', 'sensitive'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of allergyKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "Allergies mentioned";
                }
            }
        }
    }
    return "None known";
}

function extractPossibleCondition() {
    // Look for AI responses that mention possible conditions
    for (let msg of conversationHistory) {
        if (msg.type === 'ai' && (msg.message.toLowerCase().includes('condition') ||
            msg.message.toLowerCase().includes('diagnosis') ||
            msg.message.toLowerCase().includes('suggest'))) {
            // Extract first sentence that might contain condition
            const sentences = msg.message.split('.');
            for (let sentence of sentences) {
                if (sentence.toLowerCase().includes('condition') || sentence.toLowerCase().includes('suggest')) {
                    return sentence.trim().substring(0, 60) + "...";
                }
            }
        }
    }
    return "Preliminary assessment pending";
}

function extractConfidenceLevel() {
    // Generate confidence based on conversation depth
    const userMessages = conversationHistory.filter(msg => msg.type === 'user').length;
    if (userMessages >= 5) return "85";
    if (userMessages >= 3) return "70";
    if (userMessages >= 1) return "60";
    return "50";
}

function extractRiskLevel() {
    const highRiskKeywords = ['severe', 'emergency', 'urgent', 'critical', 'intense'];
    const moderateRiskKeywords = ['moderate', 'concerning', 'persistent', 'worsening'];

    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of highRiskKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "● High";
                }
            }
            for (let keyword of moderateRiskKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "● Moderate";
                }
            }
        }
    }
    return "● Low";
}

function extractEmergencyAlert() {
    const emergencyKeywords = ['emergency', 'urgent', 'severe', 'critical', 'chest pain', 'difficulty breathing'];

    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of emergencyKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "● SEEK IMMEDIATE CARE";
                }
            }
        }
    }

    // Check for moderate symptoms
    const monitorKeywords = ['persistent', 'worsening', 'concerning', 'unusual'];
    for (let msg of conversationHistory) {
        if (msg.type === 'user') {
            for (let keyword of monitorKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    return "● Monitor Closely";
                }
            }
        }
    }

    return "● None";
}

function generateNewFormatPreview() {
    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }) + ' IST';
    const reportHealthId = `AR-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;

    // Extract intelligent data from conversation
    const chiefComplaint = extractChiefComplaint();
    const duration = extractDuration();
    const severity = extractSeverity();
    const frequency = extractFrequency();
    const associatedSymptoms = extractAssociatedSymptoms();
    const medicalHistory = extractMedicalHistory();
    const currentMedications = extractCurrentMedications();
    const allergies = extractAllergies();
    const possibleCondition = extractPossibleCondition();
    const confidenceLevel = extractConfidenceLevel();
    const riskLevel = extractRiskLevel();
    const emergencyAlert = extractEmergencyAlert();
    const remedies = extractTraditionalRemedies();

    const patientName = userInfo.name || "_________________________";
    const patientLocation = userInfo.city || "____________________";

    return `🩺 AROGYA AI - EARLY DIAGNOSTIC REPORT

👤 Name: ${patientName}    📍 Location: ${patientLocation}
📆 Date: ${dateStr}    🕒 Time: ${timeStr}    🔢 Health ID: ${reportHealthId}

📋 COLLECTED SYMPTOMS
• Chief Complaint: ${chiefComplaint}
• Duration: ${duration}    • Severity (1-10): ${severity}    • Frequency: ${frequency}
• Associated Symptoms: ${associatedSymptoms}
• Medical History: ${medicalHistory}
• Current Medications: ${currentMedications}
• Allergies: ${allergies}

🤖 AI PRELIMINARY ASSESSMENT
Possible Condition: ${possibleCondition}
AI Confidence Level: ${confidenceLevel}%    Risk Level: ${riskLevel}
Emergency Alert: ${emergencyAlert}

🌿 दादी माँ के नुस्खे (TRADITIONAL REMEDIES)
1. Recommended Remedy: ${remedies.primary}
   Usage Instructions: ${remedies.primaryInstructions}
2. Alternative Remedy: ${remedies.alternative}
   Usage Instructions: ${remedies.alternativeInstructions}

👨‍⚕️ DOCTOR ANALYSIS & DIAGNOSIS
Doctor Name: _________________________    License No: ____________________

Clinical Diagnosis: _____________________________________________________

Prescribed Medications:
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

-----------------------------------------------------_____________________________________________________________________________________

Additional Instructions/Follow-up:
_______________________________________________________________________
_______________________________________________________________________
Doctor Signature: _________________________    Date: _______________

Generated by Arogya AI v2.0 - For informational purposes only`;
}

function extractTraditionalRemedies() {
    const remedyKeywords = ['remedy', 'traditional', 'home', 'natural', 'herbal', 'ayurvedic'];
    let primaryRemedy = "Warm water with honey and ginger";
    let primaryInstructions = "Take twice daily, morning and evening";
    let alternativeRemedy = "Turmeric milk before bedtime";
    let alternativeInstructions = "Mix 1 tsp turmeric in warm milk";

    // Look for AI responses mentioning remedies
    for (let msg of conversationHistory) {
        if (msg.type === 'ai') {
            for (let keyword of remedyKeywords) {
                if (msg.message.toLowerCase().includes(keyword)) {
                    // Extract remedy suggestions from AI response
                    const sentences = msg.message.split('.');
                    for (let sentence of sentences) {
                        if (sentence.toLowerCase().includes('remedy') || sentence.toLowerCase().includes('traditional')) {
                            primaryRemedy = sentence.trim().substring(0, 50) + "...";
                            break;
                        }
                    }
                }
            }
        }
    }

    return {
        primary: primaryRemedy,
        primaryInstructions: primaryInstructions,
        alternative: alternativeRemedy,
        alternativeInstructions: alternativeInstructions
    };
}

function generatePDFWithJsPDF(healthId) {
    console.log('🔥🔥🔥 NEW FORMAT PDF GENERATION CALLED!', healthId);
    try {
        // Check if jsPDF is available
        let jsPDFClass;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDFClass = window.jsPDF;
        } else {
            throw new Error('jsPDF not available');
        }

        const doc = new jsPDFClass('p', 'mm', 'a4');
        const margin = 15;
        let yPosition = 20;

        // Get current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) + ' IST';
        const reportHealthId = `AR-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;

        // Extract intelligent data from conversation
        const chiefComplaint = extractChiefComplaint();
        const duration = extractDuration();
        const severity = extractSeverity();
        const frequency = extractFrequency();
        const associatedSymptoms = extractAssociatedSymptoms();
        const medicalHistory = extractMedicalHistory();
        const currentMedications = extractCurrentMedications();
        const allergies = extractAllergies();
        const possibleCondition = extractPossibleCondition();
        const confidenceLevel = extractConfidenceLevel();
        const riskLevel = extractRiskLevel();
        const emergencyAlert = extractEmergencyAlert();
        const remedies = extractTraditionalRemedies();

        // ===== Single-Page Optimized Layout Helpers =====
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;
        const maxContentHeight = pageHeight - margin * 2 - 15; // Reserve space for footer
        const lineHeight = 3.2; // Compact line height
        const sectionSpacing = 2; // Minimal section spacing

        // Plain-text sanitizer: keep only A-Z, a-z, 0-9, spaces, and basic punctuation . , : ; - ( ) /
        function sanitize(input) {
            return String(input ?? '')
                .normalize('NFKD')
                .replace(/[^A-Za-z0-9 .,;:\-()\/]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // Truncate text to fit within specified character limit
        function truncateText(text, maxChars) {
            const clean = sanitize(text);
            return clean.length > maxChars ? clean.substring(0, maxChars - 3) + '...' : clean;
        }

        function compactSectionHeader(title) {
            title = sanitize(title);
            doc.setFillColor(66, 133, 244);
            doc.rect(margin, yPosition, contentWidth, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(title, margin + 1, yPosition + 4);
            doc.setTextColor(0, 0, 0);
            yPosition += 6 + sectionSpacing;
        }

        function compactLabelValue(label, value, maxValueChars = 60) {
            const safeVal = truncateText((value && String(value).trim()) ? String(value) : 'Not provided', maxValueChars);
            const safeLabel = sanitize(label);
            const labelWidth = 32; // mm - reduced from 36

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(safeLabel, margin, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(safeVal, margin + labelWidth, yPosition);
            yPosition += lineHeight;
        }

        function compactBulletLine(text, maxChars = 80) {
            const truncated = truncateText(text, maxChars);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text('- ', margin, yPosition);
            doc.text(truncated, margin + 3, yPosition);
            yPosition += lineHeight;
        }

        function compactInlineItems(items, separator = ' | ') {
            const combined = items.map(item => truncateText(item, 25)).join(separator);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(combined, margin, yPosition);
            yPosition += lineHeight;
        }

        // ===== Compact Title Bar =====
        doc.setFillColor(240, 248, 255);
        doc.rect(margin, yPosition, contentWidth, 8, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 37, 41);
        doc.text(sanitize("AROGYA AI - EARLY DIAGNOSTIC REPORT"), margin, yPosition + 5.5);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;

        // ===== Patient Information =====
        compactSectionHeader('Patient Information');
        const patientName = userInfo.name || 'Not provided';
        const patientAge = userInfo.age || 'Not provided';
        const patientGender = userInfo.gender || 'Not provided';
        const patientLocation = userInfo.city || 'Not provided';

        // Combine patient info in two compact lines
        compactInlineItems([`Name: ${truncateText(patientName, 20)}`, `Age: ${patientAge}`, `Gender: ${patientGender}`]);
        compactInlineItems([`Location: ${truncateText(patientLocation, 25)}`, `Date: ${dateStr}`, `Time: ${timeStr}`]);
        compactLabelValue('Health ID:', reportHealthId, 30);

        // ===== Collected Symptoms =====
        compactSectionHeader('Collected Symptoms');
        compactBulletLine(`Chief Complaint: ${chiefComplaint}`, 70);
        compactInlineItems([`Duration: ${truncateText(duration, 15)}`, `Severity: ${severity}`, `Frequency: ${truncateText(frequency, 15)}`]);
        compactBulletLine(`Associated Symptoms: ${associatedSymptoms}`, 70);
        compactBulletLine(`Medical History: ${medicalHistory}`, 70);
        compactBulletLine(`Current Medications: ${currentMedications}`, 70);
        compactBulletLine(`Allergies: ${allergies}`, 70);

        // ===== AI Preliminary Assessment =====
        compactSectionHeader('AI Preliminary Assessment');
        const riskSelected = (String(riskLevel).match(/Low|Moderate|High/) || ['Unknown'])[0];
        const emergencySelected = /SEEK/i.test(String(emergencyAlert))
            ? 'Seek Immediate Care'
            : /Monitor/i.test(String(emergencyAlert))
                ? 'Monitor Closely'
                : /None/i.test(String(emergencyAlert))
                    ? 'None'
                    : 'Unknown';

        compactLabelValue('Possible Condition:', possibleCondition, 50);
        compactInlineItems([`Confidence: ${confidenceLevel}%`, `Risk: ${riskSelected}`, `Alert: ${emergencySelected}`]);

        // ===== Traditional Remedies =====
        compactSectionHeader('Traditional Remedies');
        compactLabelValue('1. Recommended:', remedies.primary, 55);
        compactBulletLine(`Usage: ${remedies.primaryInstructions}`, 75);
        compactLabelValue('2. Alternative:', remedies.alternative, 55);
        compactBulletLine(`Usage: ${remedies.alternativeInstructions}`, 75);


        // ===== Doctor Analysis & Signature =====
        compactSectionHeader('Doctor Analysis & Diagnosis');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Clinical Diagnosis:', margin, yPosition); yPosition += lineHeight;

        // Compact diagnosis lines
        doc.setDrawColor(200);
        for (let i = 0; i < 2; i++) {
            doc.line(margin, yPosition, margin + contentWidth, yPosition);
            yPosition += lineHeight;
        }

        doc.text('Prescribed Medications:', margin, yPosition); yPosition += lineHeight;
        // Compact medication lines (5 instead of 9)
        for (let i = 0; i < 5; i++) {
            doc.line(margin, yPosition, margin + contentWidth, yPosition);
            yPosition += lineHeight;
        }

        yPosition += sectionSpacing;
        doc.text('Doctor Signature: ____________________    Date: __________', margin, yPosition);
        yPosition += lineHeight + sectionSpacing;

        // ===== Compact Footer =====
        yPosition += sectionSpacing;
        doc.setFontSize(7);
        doc.setTextColor(108, 117, 125);
        const disclaimer = 'Disclaimer: AI-generated report for informational purposes only. Not a substitute for professional medical advice.';
        doc.text(disclaimer, margin, yPosition); yPosition += lineHeight;
        doc.text(`Generated by Arogya AI v2.0 | ${dateStr} ${timeStr}`, margin, yPosition);

        // Save the PDF (should be single page now)
        const fileName = `Arogya_AI_Report_${reportHealthId}.pdf`;
        // Add page number only if multiple pages exist
        const pageCount = doc.getNumberOfPages();
        if (pageCount > 1) {
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 5);
            }
        }
        doc.save(fileName);

        // Show success message
        const successMessage = currentLanguage === 'hindi' ?
            `✅ स्वास्थ्य रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!\n📄 फ़ाइल: ${fileName}` :
            currentLanguage === 'marathi' ?
            `✅ आरोग्य अहवाल यशस्वीरित्या डाउनलोड झाला!\n📄 फाइल: ${fileName}` :
            currentLanguage === 'kannada' ?
            `✅ ಆರೋಗ್ಯ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!\n📄 ಫೈಲ್: ${fileName}` :
            `✅ Health report downloaded successfully!\n📄 File: ${fileName}`;

        // Create success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-check-circle" style="color: #16a34a;"></i>
            </div>
            <div class="message-content success-message">
                <p>${successMessage}</p>
                <div class="success-animation">
                    <i class="fas fa-download pulse"></i>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show action buttons after delay
        setTimeout(() => {
            document.getElementById('actionButtons').style.display = 'flex';
        }, 2000);



    } catch (error) {
        console.error('Error generating PDF with jsPDF:', error);
        generateTextReportNewFormat(healthId);
    }
}





function startNewConsultation() {
    // Reset all variables
    consultationPhase = 'initial';
    userInfo = {};
    conversationHistory = [];
    collectedSymptoms = {};
    aiGuidanceResponse = '';
    questionCount = 0;
    isDataCollectionComplete = false;
    currentModelIndex = 0;

    // Clear chat
    document.getElementById('chatMessages').innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="message-content">
                <p id="welcomeMessage">${translations[currentLanguage].welcome}</p>
            </div>
        </div>
    `;

    // Hide action buttons and show user info section
    document.getElementById('actionButtons').style.display = 'none';
    showUserInfoSection();
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

// Report Preview Functions
async function showReportPreview() {
    try {
        showLoading(true);

        // Prepare report data
        const reportData = prepareReportData();
        const aiAssessment = await getAIAssessmentForReport();
        const reportContent = generateNewFormatPreview();

        // Show preview in modal
        document.getElementById('reportPreviewContent').textContent = reportContent;
        document.getElementById('reportPreviewModal').style.display = 'flex';

        // Store data for actual generation
        window.pendingReportData = reportData;
        window.pendingAiAssessment = aiAssessment;

    } catch (error) {
        console.error('Error preparing report preview:', error);
        const errorMessage = currentLanguage === 'hindi' ?
            'रिपोर्ट प्रीव्यू तैयार करने में त्रुटि। कृपया पुनः प्रयास करें।' :
            currentLanguage === 'marathi' ?
            'अहवाल पूर्वावलोकन तयार करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.' :
            currentLanguage === 'kannada' ?
            'ವರದಿ ಪೂರ್ವವೀಕ್ಷಣೆ ತಯಾರಿಸುವಲ್ಲಿ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' :
            'Error preparing report preview. Please try again.';
        addMessage(errorMessage, 'ai');
    } finally {
        showLoading(false);
    }
}

function closeReportPreview() {
    document.getElementById('reportPreviewModal').style.display = 'none';
    // Clean up stored data
    delete window.pendingReportData;
    delete window.pendingAiAssessment;
}

async function confirmGenerateReport() {
    closeReportPreview();

    if (window.pendingReportData && window.pendingAiAssessment) {
        showLoading(true);
        try {
            await generatePDFReport(window.pendingReportData, window.pendingAiAssessment);
        } catch (error) {
            console.error('Error generating report:', error);
            const errorMessage = currentLanguage === 'hindi' ?
                'रिपोर्ट बनाने में त्रुटि। कृपया पुनः प्रयास करें।' :
                currentLanguage === 'marathi' ?
                'अहवाल तयार करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.' :
                currentLanguage === 'kannada' ?
                'ವರದಿ ರಚಿಸುವಲ್ಲಿ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' :
                'Error generating report. Please try again.';
            addMessage(errorMessage, 'ai');
        } finally {
            showLoading(false);
            // Clean up stored data
            delete window.pendingReportData;
            delete window.pendingAiAssessment;
        }
    } else {
        // Fallback to original generation
        generateReport();
    }
}
