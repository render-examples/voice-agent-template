import VoiceAgent from "./components/VoiceAgent";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center mb-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <svg
              className="h-10 w-10 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
            AI Voice Assistant
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Experience the power of real-time AI conversation powered by{" "}
            <span className="font-semibold text-primary">
              LiveKit Agents
            </span>
            ,{" "}
            <span className="font-semibold text-primary">
              Rime TTS
            </span>
            , and{" "}
            <span className="font-semibold text-primary">
              OpenAI
            </span>
          </p>
        </div>

        {/* Voice Agent Component */}
        <div className="w-full max-w-2xl bg-card rounded-2xl shadow-lg p-8 border border-border">
          <VoiceAgent />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 mt-12 text-sm text-muted-foreground text-center">
          <p>
            Powered by{" "}
            <a
              href="https://livekit.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              LiveKit
            </a>
            {" • "}
            <a
              href="https://rime.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Rime AI
            </a>
            {" • "}
            <a
              href="https://openai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              OpenAI
            </a>
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Render
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
