# Quick Start Guide

Get your voice agent up and running locally in 5 minutes with Docker!

## Prerequisites

- **Docker Desktop** installed ([download here](https://www.docker.com/products/docker-desktop))
- **LiveKit Cloud account** (free at https://cloud.livekit.io)
- **API Keys** (optional, but recommended):
  - Rime API key from https://rime.ai/ (for TTS)
  - OpenAI API key (for GPT-4.1 Mini LLM)
  - AssemblyAI API key (for STT)

💡 **Note**: You can use LiveKit's built-in AI services without providing API keys, but having your own keys gives you more control and potentially lower costs.

## Step-by-Step Setup

### 1. Get LiveKit Credentials

**Option A: Using LiveKit CLI (Recommended)**

Install the CLI:
```bash
# macOS
brew install livekit-cli

# Linux
curl -sSL https://get.livekit.io/cli | bash

# Windows
winget install LiveKit.LiveKitCLI
```

Get your credentials:
```bash
lk cloud auth
lk app env -w
```

This automatically creates `.env` with your LiveKit credentials!

**Option B: Manual Setup**

1. Go to https://cloud.livekit.io
2. Create a project
3. Copy your API Key, API Secret, and WebSocket URL
4. Create `.env` in the project root

### 2. Configure Environment Variables

Edit `.env` to ensure it has all required variables:

```bash
# LiveKit Cloud Configuration (from step 1)
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud

# Public LiveKit URL (required for browser - same as LIVEKIT_URL)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Optional: Your own API keys for better control
RIME_API_KEY=your_rime_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

💡 **Important**: Make sure `NEXT_PUBLIC_LIVEKIT_URL` matches your `LIVEKIT_URL`!

### 3. Start Everything with Docker Compose (Local Development)

That's it! One command to run everything locally:

```bash
docker-compose up
```

This will:
- ✅ Install all dependencies
- ✅ Download AI model files automatically
- ✅ Start the Next.js web app on http://localhost:3000
- ✅ Start the voice agent and connect to LiveKit Cloud

☕ **First time?** The initial build takes 2-3 minutes. Grab a coffee!

### 4. Test Your Agent

1. Open **http://localhost:3000** in your browser
2. Click **"Start Conversation"**
3. Allow microphone access when prompted
4. Say **"Hello!"** and wait for the AI response

🎉 **Congratulations!** Your AI voice assistant is working!

## Common Issues

### "Missing NEXT_PUBLIC_LIVEKIT_URL"

➜ **Solution**: Add this line to `.env`:
```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```
(Use the same value as `LIVEKIT_URL`)

### Agent can't connect to LiveKit Cloud

➜ **Solution**: Check your credentials in `.env`:
```bash
docker-compose logs agent
```

### Port 3000 already in use

➜ **Solution**: Stop other services using port 3000 or change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### No microphone access

➜ **Solution**: Click the lock icon in your browser's address bar and allow microphone access.

## Local Docker Commands Reference

```bash
# Start all services locally
docker-compose up                      # Start in foreground
docker-compose up -d                   # Start in background
docker-compose down                    # Stop services
docker-compose logs -f                 # View logs

# Build and start
docker-compose up --build              # Build and start

# Useful Commands
docker-compose logs agent              # View agent logs only
docker-compose logs app                # View app logs only
docker-compose restart                 # Restart all services
docker-compose ps                      # Check service status
```

## Customize Your Agent (Local Development)

### Edit Agent Settings

1. Edit `agent/agent.ts` to change:
   - **Voice**: Change `voice: "rainforest"` to another Rime voice
   - **Personality**: Update the `instructions` text
   - **Speed**: Adjust `speedAlpha` (0.9 = faster, 1.1 = slower)

2. Save the file and rebuild the container to see changes

### Customize the UI

1. Edit `app/components/VoiceAgent.tsx` to modify the interface
2. Edit `app/page.tsx` to change the home page
3. Rebuild the container to see changes

### View Logs & Debug (Local)

See what's happening in real-time during local development:

```bash
# View all logs
docker-compose logs -f

# View only agent logs (useful for debugging AI responses)
docker-compose logs -f agent

# View only app logs (useful for frontend issues)
docker-compose logs -f app
```

## Deploy to Production (Render)

Ready to go live? This project is pre-configured for production deployment to [Render](https://render.com) with automatic scaling and zero-downtime deployments.

⚠️ **Important**: The agent service requires **at least 8 GB of RAM**. Use Render's **Standard plan or higher** for the agent worker.

💡 **Note**: While Docker is great for local development, Render provides managed infrastructure for production with auto-scaling, health checks, and zero-downtime deploys.

**Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**Step 2: Connect to Render**

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`

**Step 3: Configure Environment Variables**

In the Render dashboard, add these environment variables to both services:

```bash
# Required for both services
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Required for agent service only
RIME_API_KEY=your_rime_api_key
```

**Step 4: Deploy**

Click **"Apply"** and Render will:
- ✅ Build both Docker images
- ✅ Deploy the web app (publicly accessible)
- ✅ Deploy the agent worker (private service)
- ✅ Set up auto-scaling (1-4 instances)
- ✅ Enable auto-deploy on git push

**Your app will be live at:** `https://voice-agent-app.onrender.com` (or your custom domain)

**Future deployments:** Just `git push` and Render auto-deploys! 🚀

💡 **Tip**: The `render.yaml` file configures everything automatically. Check it out to customize regions, scaling, or resources.

### Learn More

- 📖 [Agent Documentation](agent/AGENT_README.md) - Customize your agent
- 🌐 [LiveKit Docs](https://docs.livekit.io) - Full LiveKit documentation
- 💬 [LiveKit Discord](https://livekit.io/discord) - Get help from the community

## Architecture Overview (Local Development)

When running locally with Docker Compose, two services work together:

```
┌─────────────────────────────────────────────────────┐
│  Docker Compose Network (livekit-network)          │
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │   App Service    │      │  Agent Service   │   │
│  │  (Port 3000)     │      │                  │   │
│  │                  │      │  Connects to:    │   │
│  │  Next.js + React │      │  - LiveKit Cloud │   │
│  │  Voice Interface │◄─────┤  - Rime TTS      │   │
│  │                  │      │  - OpenAI GPT    │   │
│  └──────────────────┘      │  - AssemblyAI    │   │
│                            └──────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↕                           ↕
    [Browser]                [LiveKit Cloud]
                                  ↕
                           [WebRTC Audio Stream]
```

**How it works:**
1. User speaks in browser → Audio sent to LiveKit Cloud via WebRTC
2. Agent receives audio → Processes with AI (STT → LLM → TTS)
3. Agent sends response → LiveKit Cloud → User hears AI voice

## Why Docker for Local Development?

✅ **No dependency issues** - Everything runs in isolated containers  
✅ **Consistent environment** - Works the same on Mac, Windows, Linux  
✅ **Easy setup** - One command to start everything locally  
✅ **Mirrors production** - Test in a containerized environment before deploying  
✅ **Clean teardown** - Remove everything with `docker-compose down`

## Alternative: Running Without Docker (Local Development)

If you prefer not to use Docker for local development, you can run the services directly with npm:

```bash
# Step 1: Install dependencies and download models
npm install
npm run agent:download

# Step 2: Start the agent (Terminal 1)
npm run agent:dev

# Step 3: Start the web app (Terminal 2)
npm run dev
```

⚠️ **Prerequisites**: 
- Node.js 20+ installed
- May encounter platform-specific issues
- Requires running two separate terminal windows

💡 **Recommendation**: Use Docker Compose for local development (single command, easy setup) and Render for production deployment (managed infrastructure, auto-scaling, zero-downtime deploys).

## Get Help

Stuck? We're here to help!

1. 📖 Review [agent/AGENT_README.md](agent/AGENT_README.md) for agent configuration
2. 💬 Join [LiveKit Discord](https://livekit.io/discord) - Active community support
3. 🚀 [Render Community](https://community.render.com) - Deployment questions
4. 🐛 [GitHub Issues](https://github.com/livekit/agents) - Report bugs

## Troubleshooting Docker Issues

### Docker daemon not running

```bash
# macOS: Start Docker Desktop from Applications
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop from Start Menu
```

### Permission denied errors (Linux)

```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

### Containers won't start

```bash
# Clean rebuild
docker-compose down -v
docker-compose up --build
```

---

**Ready to build something amazing?** Start chatting with your agent and explore what's possible with real-time voice AI! 🚀

