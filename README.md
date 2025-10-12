# Interview IQ - AI-Powered Interview System

## 🚀 Features

### ✅ **Implemented Features:**

1. **Real-time Audio Interview System**
   - WebSocket-based communication between client and server
   - Live audio streaming and processing
   - Real-time feedback and insights

2. **AI-Powered Question Generation**
   - Contextual questions based on difficulty level (Easy, Medium, Hard)
   - Subject-specific questions (Frontend, Backend, General)
   - Persona-based question styling (Professional, Friendly, Strict)
   - Adaptive questioning based on previous responses

3. **Advanced Speech Analysis**
   - Filler word detection (um, uh, like, etc.)
   - Speaking rate analysis (words per minute)
   - Confidence scoring based on language patterns
   - Clarity and fluency assessment
   - Real-time insights and recommendations

4. **Comprehensive Database Storage**
   - Interview sessions tracking
   - Question and answer storage
   - Performance metrics and scoring
   - Session management and status tracking

5. **Dynamic Interview Flow**
   - Automatic question progression
   - Follow-up question generation
   - Performance-based adaptation
   - Live feedback system

## 🛠 **Technical Architecture**

### **Frontend (React + Socket.IO)**
- Real-time audio streaming
- Dynamic question display
- Live insights panel
- Interview configuration dialog
- Fullscreen interview experience

### **Backend (Flask + Socket.IO + AI)**
- WebSocket communication
- AI-powered question generation
- Speech pattern analysis
- SQLite database for persistence
- Real-time feedback system

## 📦 **Installation & Setup**

### **1. Install Dependencies**

```bash
# Backend dependencies
cd server-flask
pip install -r requirements.txt

# Frontend dependencies  
cd ../client
npm install
```

### **2. Start the Backend Server**

```bash
cd server-flask
python app_working.py
```

The server will start on `http://localhost:5000`

### **3. Start the Frontend**

```bash
cd client
npm start
```

The client will start on `http://localhost:3000`

## 🎯 **How It Works**

### **Interview Flow:**

1. **Setup Phase:**
   - User selects difficulty level (Easy/Medium/Hard)
   - Chooses AI model (ChatGPT/Claude/Gemini/Llama)
   - Picks interviewer persona
   - Selects interview type (Audio/Video)

2. **Interview Phase:**
   - System generates first contextual question
   - User provides audio response
   - Real-time speech analysis and feedback
   - Dynamic follow-up question generation
   - Continuous performance tracking

3. **Analysis Phase:**
   - Comprehensive speech quality analysis
   - Technical content evaluation
   - Performance scoring and insights
   - Improvement recommendations

### **AI Components:**

1. **Question Generator:**
   - 3-tier difficulty system
   - Subject-specific question banks
   - Persona-based question styling
   - Context-aware follow-ups

2. **Speech Analyzer:**
   - Filler word detection and counting
   - Speaking rate optimization
   - Confidence level assessment
   - Clarity and fluency scoring

3. **Feedback System:**
   - Real-time insights during interview
   - Post-answer comprehensive feedback
   - Performance trend analysis
   - Actionable improvement suggestions

## 🔧 **Configuration Options**

### **Interview Configuration:**
```javascript
{
  difficulty: "Easy" | "Medium" | "Hard",
  llm: "ChatGPT" | "Claude" | "Gemini" | "Llama",
  interviewType: "audio" | "video",
  persona: "professional_man" | "professional_woman" | "friendly_mentor" | "strict_interviewer",
  subject: "frontend" | "backend" | "general"
}
```

### **Analysis Parameters:**
- Filler word thresholds
- Speaking rate optimization (140-160 WPM)
- Confidence scoring algorithms
- Real-time feedback triggers

## 📊 **Data Flow**

1. **Client** → **Server**: Interview configuration, audio chunks
2. **Server** → **AI Engine**: Question generation, speech analysis
3. **Database**: Session storage, performance tracking
4. **Server** → **Client**: Questions, insights, feedback
5. **Real-time**: Live audio processing and feedback

## 🎨 **UI Components**

- **InterviewOptionsDialog**: Configuration selection
- **AudioInterview**: Main interview interface
- **WaveCircle**: Visual audio indicators
- **AIInsightsPanel**: Real-time feedback display
- **CurrentQuestionDisplay**: Dynamic question presentation
- **InterviewInfoPanel**: Session information and config display

## 🧠 **AI Features Ready for Extension**

The system is designed to easily integrate:
- **CrewAI agents** for advanced interview management
- **OpenAI Whisper** for high-quality speech-to-text
- **Advanced NLP models** for content analysis
- **Machine learning** for performance prediction
- **Custom evaluation models** for technical accuracy

## 🚦 **Current Status**

✅ **Working Features:**
- Complete interview flow
- Real-time communication
- Question generation system
- Speech analysis algorithms
- Database persistence
- Live feedback system

🔄 **Ready for Enhancement:**
- Advanced AI model integration
- Real audio transcription
- Video interview capabilities
- Advanced analytics dashboard
- Performance comparison tools

## 🤝 **Contributing**

The system is modular and extensible. Key areas for contribution:
- Enhanced AI models
- Advanced speech processing
- UI/UX improvements
- Performance optimizations
- Additional interview domains

---

**Built with:** React, Flask, Socket.IO, SQLite, and AI-powered analysis algorithms.