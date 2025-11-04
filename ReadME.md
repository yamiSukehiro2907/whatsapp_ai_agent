# FinPal - WhatsApp AI Financial Assistant 💰

FinPal is an intelligent financial planning assistant that operates through WhatsApp, powered by Google's Gemini AI. It helps users achieve their financial goals through personalized guidance, progressive profile building, and educational conversations.

## Features

- 💬 **WhatsApp Integration** - Chat with FinPal directly through WhatsApp using Twilio
- 🤖 **AI-Powered Guidance** - Uses Google Gemini 2.0 Flash for intelligent financial advice
- 👤 **User Profile Building** - Progressively learns about users' financial situations
- 💾 **Conversation History** - Maintains context across sessions using SQLite
- 📊 **Personalized Advice** - Tailored recommendations based on user profiles
- 🔒 **Privacy First** - Never asks for sensitive information like account numbers or SSNs

## Prerequisites

- Node.js (v20.x, 22.x, 23.x, or 24.x)
- A Twilio account with WhatsApp sandbox or approved number
- Google Gemini API key
- Basic understanding of webhooks

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yamiSukehiro2907/whatsapp_ai_agent
   cd whatsapp_ai_agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # Twilio Configuration
   TWILIO_ACCOUNT_SID1=your_twilio_account_sid
   TWILIO_AUTH_TOKEN1=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=whatsapp:+14155238886
   ```

4. **Initialize the database**
   ```bash
   node config/db.js
   ```

## Configuration

### Getting Your API Keys

**Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env` file

**Twilio Credentials:**
1. Sign up at [Twilio](https://www.twilio.com/)
2. Go to Console Dashboard
3. Copy your Account SID and Auth Token
4. For WhatsApp, set up the [WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox) or request approval for a production number

### Setting Up Twilio Webhook

1. Start your server (see Usage section)
2. Use a tool like [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 3000
   ```
3. Copy the ngrok HTTPS URL
4. In Twilio Console → WhatsApp Sandbox Settings, set the webhook URL:
   ```
   https://your-ngrok-url.ngrok.io/whatsapp-hook
   ```

## Usage

1. **Start the server**
   ```bash
   node index.js
   ```
   
   You should see:
   ```
   ✅ Database and tables created successfully.
   Server started on http://localhost:3000
   ```

2. **Connect to WhatsApp**
   - Send the join code to your Twilio WhatsApp number
   - Example: `join <your-sandbox-code>`

3. **Start chatting**
   - Send any message to FinPal
   - The AI will greet you and begin learning about your financial situation

## Project Structure

```
whatsapp_ai_agent/
├── config/
│   ├── db.js              # Database initialization
│   ├── llm.config.js      # Gemini AI configuration
│   └── twilio.config.js   # Twilio setup
├── controllers/
│   └── chat.controller.js # Main chat logic
├── routers/
│   └── chat.route.js      # Express routes
├── database.js            # Database connection export
├── index.js               # Application entry point
├── chat.db                # SQLite database (auto-generated)
├── package.json           # Project dependencies
└── .env                   # Environment variables (create this)
```

## Database Schema

### Users Table
- `user_id` - Auto-incrementing primary key
- `phone_number` - Unique user identifier (WhatsApp number)
- `financial_profile` - JSON object storing user's financial information
- `created_at` - Timestamp of user registration

### Messages Table
- `message_id` - Auto-incrementing primary key
- `user_id` - Foreign key to Users table
- `sender_role` - Either 'user' or 'ai'
- `content` - Message text
- `created_at` - Timestamp of message

## How It Works

1. **Message Receipt**: When a user sends a WhatsApp message, Twilio forwards it to your webhook endpoint
2. **User Identification**: The system checks if the user exists; if not, creates a new user profile
3. **Context Loading**: Retrieves the last 10 messages for conversation context
4. **AI Processing**: Sends the message with context to Gemini AI
5. **Profile Updates**: Parses AI responses for profile update markers (e.g., `📝 PROFILE_UPDATE: age_range=30s`)
6. **Database Storage**: Saves both user and AI messages
7. **Response Delivery**: Sends AI response back to user via Twilio

## FinPal's Capabilities

FinPal provides guidance on:
- 🎯 Goal setting (short, medium, and long-term)
- 💰 Budgeting strategies
- 💳 Debt management (avalanche vs snowball methods)
- 🏦 Emergency fund building
- 📈 Investment principles (NOT specific stocks/funds)
- 🔄 Asset allocation concepts
- 📊 Risk tolerance assessment

## Important Disclaimers

⚠️ **FinPal is educational only** - Every response includes: "💡 Note: This is educational information, not professional financial advice."

🚫 **What FinPal NEVER does:**
- Request sensitive data (SSN, account numbers, passwords)
- Recommend specific stocks, bonds, or cryptocurrencies
- Recommend specific mutual funds or ETFs by name
- Provide exact dollar amounts for specific investments

## Customization

### Modifying AI Behavior

Edit `config/llm.config.js` to change:
- System instructions
- Conversation approach
- Question strategy
- Profile information to collect

### Changing Conversation History Length

In `controllers/chat.controller.js`, modify this line:
```javascript
"SELECT sender_role, content FROM Messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
```
Change `LIMIT 10` to your preferred number.

## Troubleshooting

**Database not initializing:**
```bash
node config/db.js
```

**Twilio webhook not receiving messages:**
- Check ngrok is running
- Verify webhook URL in Twilio console
- Ensure HTTPS (not HTTP) URL

**AI not responding:**
- Verify GEMINI_API_KEY is correct
- Check API quota limits
- Review console logs for errors

**Profile updates not saving:**
- Check that AI responses include `📝 PROFILE_UPDATE:` markers
- Verify database write permissions

## API Rate Limits

- **Gemini API**: Check your tier limits at [Google AI Studio](https://ai.google.dev/pricing)
- **Twilio**: Free trial has message limits; upgrade for production use

## Security Considerations

- Never commit `.env` file to version control
- Use environment variables for all secrets
- Implement rate limiting for production
- Consider adding authentication for webhook endpoint
- Review and sanitize user inputs

## Future Enhancements

Potential improvements:
- [ ] Add conversation analytics
- [ ] Implement multi-language support
- [ ] Create web dashboard for profile viewing
- [ ] Add scheduled financial tips/reminders
- [ ] Implement conversation export feature
- [ ] Add voice message support

## Dependencies

Key packages:
- **express**: Web server framework
- **@google/genai**: Google Gemini AI SDK
- **twilio**: WhatsApp/SMS integration
- **better-sqlite3**: Fast SQLite database
- **body-parser**: Parse incoming request bodies
- **dotenv**: Environment variable management

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Acknowledgments

- **Google Gemini** for AI capabilities
- **Twilio** for WhatsApp integration
- **better-sqlite3** for reliable local storage

---

**Built with ❤️ for financial education and empowerment**

*Remember: FinPal is an educational tool. Always consult licensed financial professionals for personalized advice.*
