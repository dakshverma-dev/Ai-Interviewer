'use client';

import { Conversation, type VoiceConversation } from '@elevenlabs/client';
import { useCredits, getCreditsRemaining } from './creditLimiter';

export interface ConversationConfig {
  apiKey: string;
  agentId: string;
  sessionId?: string;
}

export class InterviewConversationManager {
  private conversation: VoiceConversation | null = null;
  private isConnected = false;
  private conversationId: string = '';
  private config: ConversationConfig;

  constructor(config: ConversationConfig) {
    this.config = config;
  }

  async connect(
    onMessage: (message: string, role: 'agent' | 'user') => void,
    onSpeaking?: (isSpeaking: boolean) => void
  ): Promise<void> {
    // The agent must be configured as "public" in the ElevenLabs dashboard for
    // this to work — a plain agentId connects without a signed URL/token, so no
    // secret key is sent from the browser.
    await navigator.mediaDevices.getUserMedia({ audio: true });

    this.conversation = await Conversation.startSession({
      agentId: this.config.agentId,
      connectionType: 'webrtc',
      textOnly: false,
      onConnect: ({ conversationId }) => {
        this.conversationId = conversationId;
        this.isConnected = true;
        console.log('[11Labs] Connected ✓, conversation:', conversationId);
      },
      onDisconnect: (details) => {
        this.isConnected = false;
        console.log('[11Labs] Disconnected:', details);
      },
      onMessage: ({ message, role }) => {
        console.log('[11Labs] >>', role, message);
        onMessage(message, role);
      },
      onModeChange: ({ mode }) => {
        onSpeaking?.(mode === 'speaking');
      },
      onError: (message, context) => {
        console.error('[11Labs] Error:', message, context);
      },
    });
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.conversation) {
      throw new Error('Conversation not connected');
    }

    const sessionId = this.config.sessionId || 'default';
    if (!useCredits(sessionId, text.length)) {
      const remaining = getCreditsRemaining(sessionId);
      const error = `Credit limit exceeded. 2000 credits max per session. Remaining: ${remaining}`;
      console.error('[11Labs] ' + error);
      throw new Error(error);
    }

    console.log('[11Labs] >> Sending:', text);
    this.conversation.sendUserMessage(text);
  }

  async disconnect(): Promise<void> {
    if (this.conversation) {
      console.log('[11Labs] Disconnecting');
      await this.conversation.endSession();
      this.conversation = null;
      this.isConnected = false;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getConversationId(): string {
    return this.conversationId;
  }
}
