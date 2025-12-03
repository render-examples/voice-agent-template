'use client';

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useRoomInfo,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { cn } from '../lib/utils';
import '@livekit/components-styles';

interface VoiceAgentProps {
  roomName?: string;
}

function AgentControls() {
  const { state, audioTrack } = useVoiceAssistant();
  const roomInfo = useRoomInfo();
  const connectionState = useConnectionState();

  const getStateLabel = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting...';
      case 'initializing':
        return 'Initializing...';
      case 'listening':
        return 'Listening';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking';
      default:
        return 'Ready';
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-green-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'speaking':
        return 'bg-primary';
      case 'connecting':
      case 'initializing':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={cn("w-4 h-4 rounded-full animate-pulse", getStateColor())} />
        <span className="text-lg font-medium text-foreground">
          {getStateLabel()}
        </span>
      </div>

      {/* Audio Visualizer */}
      {audioTrack && connectionState === ConnectionState.Connected && (
        <div className="w-full h-32 flex items-center justify-center bg-muted rounded-xl p-4 border border-border">
          <BarVisualizer
            state={state}
            barCount={15}
            trackRef={audioTrack}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Room Info */}
      {roomInfo.name && (
        <div className="text-sm text-muted-foreground">
          Room: {roomInfo.name}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-sm">
        {connectionState === ConnectionState.Connected ? (
          <p>Start speaking to interact with your AI voice assistant.</p>
        ) : (
          <p>Connecting to your voice assistant...</p>
        )}
      </div>
    </div>
  );
}

export default function VoiceAgent({ roomName = 'voice-agent-room' }: VoiceAgentProps) {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [canRender, setCanRender] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
  console.log('serverUrl', serverUrl);

  const connectToAgent = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError('');

    try {
      const participantName = `user-${Math.floor(Math.random() * 10000)}`;
      const response = await fetch(
        `/api/token?roomName=${encodeURIComponent(roomName)}&participantName=${encodeURIComponent(participantName)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get access token');
      }

      const data = await response.json();
      setToken(data.token);
      setIsConnecting(false);
      setIsConnected(true);
      // Delay rendering to ensure clean mount
      setTimeout(() => setCanRender(true), 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [roomName, isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    // First prevent rendering
    setCanRender(false);
    // Clear token to unmount LiveKitRoom
    setToken('');
    // Wait for complete cleanup to ensure microphone is properly released
    setTimeout(() => {
      setIsConnected(false);
      setIsConnecting(false);
    }, 1000);
  }, []);

  if (!serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-xl border border-destructive/20">
        <p className="text-destructive text-center">
          Missing NEXT_PUBLIC_LIVEKIT_URL environment variable.
          <br />
          Please add it to your .env file.
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-2xl font-bold text-foreground">
          Voice AI Assistant
        </h2>
        <p className="text-center text-muted-foreground max-w-md">
          Connect to your AI-powered voice assistant. Click the button below to start a
          conversation.
        </p>
        <button
          onClick={connectToAgent}
          disabled={isConnecting}
          className={cn(
            "px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg",
            "hover:bg-primary/90 hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isConnecting ? 'Connecting...' : 'Start Conversation'}
        </button>
        {error && (
          <div className="text-destructive text-sm max-w-md text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Show initializing state when connected but not ready to render
  if (isConnected && !canRender) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full animate-pulse bg-muted-foreground" />
          <span className="text-lg font-medium text-foreground">
            Initializing microphone...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {token && canRender && (
        <LiveKitRoom
          key={token}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={{
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }}
          video={false}
          onDisconnected={disconnect}
          onConnected={() => console.log('Connected to room')}
          onError={(error) => console.error('LiveKit error:', error)}
          className="flex flex-col items-center gap-6 w-full"
        >
          <AgentControls />
          <RoomAudioRenderer />
          <button
            onClick={disconnect}
            className={cn(
              "mt-4 px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-lg transition-colors",
              "hover:bg-destructive/90",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            End Conversation
          </button>
        </LiveKitRoom>
      )}
    </div>
  );
}

