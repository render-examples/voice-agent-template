import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  inference,
  metrics,
  voice,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { TTS } from '@livekit/agents-plugin-rime';

dotenv.config({ path: '.env' });

async function loadNoiseCancellation() {
  try {
    const mod = await import('@livekit/noise-cancellation-node');
    return mod.BackgroundVoiceCancellation();
  } catch {
    console.warn('Noise cancellation unavailable — running without it');
    return undefined;
  }
}

class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: `You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.`,

      // To add tools, specify `tools` in the constructor.
      // Here's an example that adds a simple weather tool.
      // You also have to add `import { llm } from '@livekit/agents' and `import { z } from 'zod'` to the top of this file
      // tools: {
      //   getWeather: llm.tool({
      //     description: `Use this tool to look up current weather information in the given location.
      //
      //     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.`,
      //     parameters: z.object({
      //       location: z
      //         .string()
      //         .describe('The location to look up weather information for (e.g. city name)'),
      //     }),
      //     execute: async ({ location }) => {
      //       console.log(`Looking up weather for ${location}`);
      //
      //       return 'sunny with a temperature of 70 degrees.';
      //     },
      //   }),
      // },
    });
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    console.log('Starting new agent session');

    // Track resources for cleanup
    let session: voice.AgentSession | null = null;
    let usageCollector: metrics.UsageCollector | null = null;
    let metricsHandler: ((ev: any) => void) | null = null;

    try {
      // Set up a voice AI pipeline via LiveKit Inference (STT, LLM, TTS) and the LiveKit turn detector
      session = new voice.AgentSession({
        // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        // See all available models at https://docs.livekit.io/agents/models/stt/
        stt: new inference.STT({
          model: 'assemblyai/universal-streaming',
          language: 'en',
        }),

        // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        // See all providers at https://docs.livekit.io/agents/models/llm/
        llm: new inference.LLM({
          model: 'openai/gpt-5.2',
        }),

        // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        // See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts: new TTS({
          model: 'mistv2',
          voice: 'rainforest',
        }),

        // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        // See more at https://docs.livekit.io/agents/build/turns
        turnDetection: new livekit.turnDetector.MultilingualModel(),
        vad: ctx.proc.userData.vad! as silero.VAD,
      });

      // Metrics collection, to measure pipeline performance
      // For more information, see https://docs.livekit.io/agents/build/metrics/
      usageCollector = new metrics.UsageCollector();

      // Store the handler so we can remove it later
      metricsHandler = (ev: any) => {
        metrics.logMetrics(ev.metrics);
        usageCollector?.collect(ev.metrics);
      };

      session.on(voice.AgentSessionEventTypes.MetricsCollected, metricsHandler);

      const logUsage = async () => {
        if (usageCollector) {
          const summary = usageCollector.getSummary();
          console.log(`Usage: ${JSON.stringify(summary)}`);
        }
      };

      // Register cleanup callback
      ctx.addShutdownCallback(async () => {
        console.log('Shutting down agent session');
        await logUsage();

        // Clean up event listener
        if (session && metricsHandler) {
          session.off(voice.AgentSessionEventTypes.MetricsCollected, metricsHandler);
        }

        // Close the session
        if (session) {
          try {
            await session.close();
          } catch (error) {
            console.error('Error closing session:', error);
          }
        }

        // Clear references to allow garbage collection
        session = null;
        usageCollector = null;
        metricsHandler = null;
      });

      // Join the room first so the agent can see participants
      await ctx.connect();

      const noiseCancellation = await loadNoiseCancellation();

      // Start the voice pipeline session
      await session.start({
        agent: new Assistant(),
        room: ctx.room,
        inputOptions: {
          // LiveKit Cloud enhanced noise cancellation
          // - If self-hosting, omit this parameter
          // - For telephony applications, use `BackgroundVoiceCancellationTelephony` for best results
          ...(noiseCancellation && { noiseCancellation }),
        },
      });

      console.log('Agent session started successfully');
    } catch (error) {
      console.error('Error in agent entry:', error);

      // Ensure cleanup happens even on error
      if (session && metricsHandler) {
        try {
          session.off(voice.AgentSessionEventTypes.MetricsCollected, metricsHandler);
        } catch (cleanupError) {
          console.error('Error removing event listener:', cleanupError);
        }
      }

      if (session) {
        try {
          await session.close();
        } catch (cleanupError) {
          console.error('Error closing session on error:', cleanupError);
        }
      }

      // Clear references
      session = null;
      usageCollector = null;
      metricsHandler = null;

      throw error;
    }
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
