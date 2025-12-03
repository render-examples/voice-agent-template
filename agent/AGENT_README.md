# LiveKit Voice Agent with Rime TTS

This project includes a LiveKit voice agent that uses the Rime TTS plugin for high-quality text-to-speech synthesis.

## Architecture

The agent uses a **STT-LLM-TTS pipeline**:
- **STT (Speech-to-Text)**: AssemblyAI Universal-Streaming
- **LLM (Language Model)**: OpenAI GPT-4.1 mini (via LiveKit Inference)
- **TTS (Text-to-Speech)**: Rime TTS with the `mistv2` model and `rainforest` voice
- **VAD (Voice Activity Detection)**: Silero VAD
- **Turn Detection**: LiveKit Multilingual Turn Detector
- **Noise Cancellation**: Background Voice Cancellation

## Prerequisites

1. **Node.js**: Version 20 or higher
2. **LiveKit Cloud Account**: Sign up at [https://cloud.livekit.io/](https://cloud.livekit.io/)
3. **Rime API Key**: Get your API key from [https://rime.ai/](https://rime.ai/)
4. **LiveKit CLI**: Install the LiveKit CLI for managing API keys and deployments

### Install LiveKit CLI

**macOS**:
```bash
brew install livekit-cli
```

**Linux**:
```bash
curl -sSL https://get.livekit.io/cli | bash
```

**Windows**:
```bash
winget install LiveKit.LiveKitCLI
```

## Setup

### 1. Install Dependencies

All required dependencies are already listed in `package.json`. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file has been created for you. You need to populate it with your API keys:

#### Get LiveKit Cloud API Keys

Run the following command to automatically populate your LiveKit Cloud credentials:

```bash
lk cloud auth
lk app env -w
```

This will update your `.env` file with:
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`

#### Add Rime API Key

Manually add your Rime API key to `.env`:

```
RIME_API_KEY=your_rime_api_key_here
```

### 3. Download Model Files

Before running the agent, download the required model files for VAD, turn detection, and noise cancellation:

```bash
npm run agent:download
```

This command will:
1. Compile the TypeScript code
2. Download the Silero VAD model files
3. Download the turn detector model files
4. Download the noise cancellation model files

## Running the Agent

### Development Mode

To run the agent in development mode (connects to LiveKit Cloud):

```bash
npm run agent:dev
```

This will:
- Start the agent in development mode
- Connect to your LiveKit Cloud project
- Make the agent available to join rooms

### Testing in the Playground

Once your agent is running in dev mode, you can test it using the [LiveKit Agents Playground](https://cloud.livekit.io/projects/p_/agents):

1. Go to your LiveKit Cloud dashboard
2. Navigate to the Agents section
3. Click on "Playground"
4. Start a conversation with your agent

### Production Mode

To run the agent in production mode:

```bash
npm run agent:build
npm run agent:start
```

## Deploying to LiveKit Cloud

To deploy your agent to LiveKit Cloud:

```bash
lk agent create
```

This will:
1. Create a `Dockerfile` and `.dockerignore` in your project
2. Create a `livekit.toml` configuration file
3. Build and deploy your agent to LiveKit Cloud
4. Make your agent available 24/7

## Customizing the Agent

### Change the Voice

To use a different Rime voice, modify the `speaker` parameter in `agent.ts`:

```typescript
tts: new rime.TTS({
  modelId: "mistv2",
  speaker: "lagoon", // Change to any Rime voice ID
  speedAlpha: 0.9,
  reduceLatency: true,
}),
```

Available voices can be found in the [Rime documentation](https://docs.rime.ai/api-reference/voices).

### Change the Model

To use a different Rime model, modify the `modelId` parameter:

```typescript
tts: new rime.TTS({
  modelId: "arcana", // Options: "mist", "mistv2", "arcana"
  speaker: "rainforest",
  speedAlpha: 0.9,
  reduceLatency: true,
}),
```

### Adjust Speech Speed

Modify the `speedAlpha` parameter:
- Values < 1.0: Faster speech
- Values > 1.0: Slower speech
- Default: 1.0

```typescript
speedAlpha: 0.9, // Slightly faster
```

### Modify Agent Instructions

Change the agent's personality and behavior by editing the `instructions` in the `Assistant` class:

```typescript
class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: `Your custom instructions here...`,
    });
  }
}
```

## Using LiveKit Inference for Rime

Alternatively, you can use Rime through LiveKit Inference (which handles billing automatically):

```typescript
const session = new voice.AgentSession({
  vad,
  stt: "assemblyai/universal-streaming:en",
  llm: "openai/gpt-4.1-mini",
  tts: "rime/arcana:astra", // Use LiveKit Inference
  turnDetection: new livekit.turnDetector.MultilingualModel(),
});
```

This approach:
- Simplifies billing (charged through LiveKit)
- Removes the need for a separate Rime API key
- May have different pricing

## Integrating with Next.js Frontend

To connect your Next.js app to the agent:

1. Install the LiveKit React components:
```bash
npm install @livekit/components-react livekit-client
```

2. Create a voice agent component in your Next.js app
3. Use the LiveKit React hooks to connect to rooms
4. The agent will automatically join when a participant enters

See the [LiveKit Next.js quickstart](https://docs.livekit.io/home/quickstarts/nextjs.md) for detailed frontend integration.

## Telephony Integration

To enable phone call capabilities:

1. Set up a SIP trunk (Twilio, Telnyx, etc.)
2. Configure the trunk in your LiveKit Cloud dashboard
3. Update the noise cancellation setting in `agent.ts`:

```typescript
inputOptions: {
  noiseCancellation: TelephonyBackgroundVoiceCancellation(), // For phone calls
},
```

See the [Telephony integration guide](https://docs.livekit.io/agents/start/telephony.md) for details.

## Troubleshooting

### Agent won't start
- Ensure all environment variables are set in `.env`
- Run `npm run agent:download` to download model files
- Check that you're authenticated with LiveKit CLI: `lk cloud auth`

### No audio output
- Verify your Rime API key is correct
- Check that the model and voice IDs are valid
- Review the agent logs for TTS errors

### Connection issues
- Verify your LiveKit Cloud credentials
- Ensure your network allows WebSocket connections
- Check the LiveKit Cloud status page

## Additional Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents)
- [Rime TTS Plugin Guide](https://docs.livekit.io/agents/models/tts/plugins/rime)
- [Rime API Documentation](https://docs.rime.ai/)
- [LiveKit Cloud Dashboard](https://cloud.livekit.io/)
- [LiveKit Discord Community](https://livekit.io/discord)

## Project Structure

```
render-voice-agent/
├── agent.ts              # LiveKit agent code
├── .env                 # Environment variables (not in git)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── app/                 # Next.js application
│   └── page.tsx        # Main page
└── AGENT_README.md     # This file
```

## Next Steps

1. **Test your agent**: Run `npm run agent:dev` and test in the playground
2. **Build a frontend**: Create a Next.js page to interact with your agent
3. **Add custom tools**: Extend the agent with function calling capabilities
4. **Deploy**: Use `lk agent create` to deploy to LiveKit Cloud
5. **Monitor**: Check logs and metrics in the LiveKit Cloud dashboard

