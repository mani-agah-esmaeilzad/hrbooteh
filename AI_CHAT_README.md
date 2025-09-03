# Mr. Ahmadi AI Chat System

This system replaces the original Python Telegram bot with a Next.js server-side implementation that provides the same functionality for evaluating user independence through natural conversation.

## Overview

The Mr. Ahmadi AI Chat System simulates a conversation between a user and "Mr. Ahmadi," an innovative manager who evaluates the user's "Need for Independence" through workplace scenarios. The system uses Google's Gemini 1.5 Flash model to generate natural responses and analyze conversations.

## Architecture

### Core Components

1. **AI Configuration** (`src/lib/ai-gemini.ts`)
   - Google Gemini AI client configuration
   - System prompts and analysis logic
   - Response generation functions

2. **Conversation Management** (`src/lib/ai-conversations.ts`)
   - Session state management
   - Chat history storage (in-memory)
   - Session lifecycle management

3. **API Routes**
   - `POST /api/ai-chat/start` - Initialize new conversation
   - `POST /api/ai-chat/message` - Send message and get AI response
   - `POST /api/ai-chat/analyze` - Trigger analysis
   - `GET /api/ai-chat/analyze` - Check analysis readiness

## API Usage

### 1. Start a New Conversation

```javascript
POST /api/ai-chat/start
Content-Type: application/json

{
  "userName": "احمد",
  "userId": "optional-user-id"
}
```

**Response:**
```javascript
{
  "success": true,
  "sessionId": "uuid-session-id",
  "message": "سلام احمد، خیلی خوشحالم که اینجایی...",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. Send Messages

```javascript
POST /api/ai-chat/message
Content-Type: application/json

{
  "sessionId": "uuid-session-id",
  "message": "من فکر می‌کنم اول باید تیم را جمع کنم"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "ایده جالبیه. فرض کن نصف تیم با این رویکرد مخالف باشن...",
  "sessionId": "uuid-session-id",
  "timestamp": "2024-01-01T12:01:00Z",
  "shouldAnalyze": false,
  "status": "active"
}
```

### 3. Request Analysis

```javascript
POST /api/ai-chat/analyze
Content-Type: application/json

{
  "sessionId": "uuid-session-id"
}
```

**Response:**
```javascript
{
  "success": true,
  "sessionId": "uuid-session-id",
  "analysis": "تحلیل نهایی نیاز به استقلال\n\nامتیاز کل شما: 4/6...",
  "message": "تحلیل با موفقیت انجام شد",
  "timestamp": "2024-01-01T12:05:00Z"
}
```

## Environment Variables

Make sure the following environment variable is set in your `.env` file:

```
GOOGLE_API_KEY=your-gemini-api-key-here
```

## Key Features

### 1. Natural Conversation Flow
- Mr. Ahmadi starts with a predefined opening scenario
- AI generates contextually appropriate follow-up questions
- Challenges user responses with hypothetical situations

### 2. Automatic Analysis Triggering
- System automatically detects when enough conversation data is available
- Uses AI to determine analysis readiness
- Provides detailed independence score breakdown

### 3. Session Management
- 30-minute session timeout
- Automatic cleanup of expired sessions
- In-memory storage (can be replaced with database)

### 4. Error Handling
- Graceful fallbacks for AI service errors
- Quota limit handling
- Network error resilience

## Independence Evaluation Criteria

The system evaluates users on 6 factors:

1. **نگرش به کارهای جدید و نامعمول** (Attitude towards new tasks)
2. **تمایل به خودمختاری** (Desire for autonomy) 
3. **ترجیح رهبری** (Leadership preference)
4. **اتکا به خود** (Self-reliance)
5. **پایبندی به دستورالعمل‌ها** (Adherence to instructions)
6. **قاطعیت و خودرأیی** (Assertiveness/Self-willed nature)

Each factor is scored 0 or 1, with a total possible score of 6.

## Integration Example

```javascript
// Start conversation
const startResponse = await fetch('/api/ai-chat/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userName: 'احمد' })
});

const { sessionId, message } = await startResponse.json();

// Send messages
const messageResponse = await fetch('/api/ai-chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    sessionId, 
    message: 'پاسخ کاربر' 
  })
});

// Check for analysis readiness
if (messageResponse.shouldAnalyze) {
  const analysisResponse = await fetch('/api/ai-chat/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  
  const { analysis } = await analysisResponse.json();
  console.log(analysis); // Display final report
}
```

## Migration from Python Bot

This system maintains full compatibility with the original Python Telegram bot logic:

- Same opening message and conversation flow
- Identical analysis criteria and scoring
- Same prompts and response patterns
- Equivalent error handling and fallbacks

The main differences are:
- REST API instead of Telegram bot interface
- Session-based architecture instead of user ID mapping
- Next.js server-side rendering instead of Python asyncio

## Performance Considerations

- In-memory session storage (suitable for moderate traffic)
- 30-minute session timeout to prevent memory leaks
- Automatic cleanup of expired sessions
- AI response caching could be added for common scenarios

## Security Notes

- API keys are server-side only (not exposed to client)
- Session IDs are UUIDs for security
- Input validation on all endpoints
- No persistent storage of sensitive conversation data
