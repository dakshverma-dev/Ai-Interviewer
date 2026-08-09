'use client';

import { useCredits, getCreditsRemaining } from './creditLimiter';

export interface ConversationConfig {
  apiKey: string;
  agentId: string;
  sessionId?: string;
}

export class InterviewConversationManager {
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private onMessageCallback?: (message: string, role: 'agent' | 'user') => void;
  private onSpeakingCallback?: (isSpeaking: boolean) => void;
  private conversationId: string = '';
  private config: ConversationConfig;

  constructor(config: ConversationConfig) {
    this.config = config;
  }

  async connect(
    onMessage: (message: string, role: 'agent' | 'user') => void,
    onSpeaking?: (isSpeaking: boolean) => void
  ): Promise<void> {
    this.onMessageCallback = onMessage;
    this.onSpeakingCallback = onSpeaking;

    try {
      console.log('[11Labs] Initializing with agent:', this.config.agentId);
      console.log('[11Labs] API Key present:', !!this.config.apiKey);

      // 11Labs Convai uses direct WebSocket connection with auth
      // The endpoint expects credentials in the URL or as first message
      console.log('[11Labs] Attempting direct WebSocket connection...');

      const wsUrl = `wss://api.elevenlabs.io/convai?agent_id=${encodeURIComponent(
        this.config.agentId
      )}&xi-api-key=${encodeURIComponent(this.config.apiKey)}`;

      return this._connectWebSocket(wsUrl);
    } catch (error) {
      console.error('[11Labs] Connection setup failed:', error);
      throw error;
    }
  }

  private _connectWebSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[11Labs] Creating WebSocket connection...');
        console.log('[11Labs] URL:', url.substring(0, 50) + '...');

        // For direct WebSocket, append headers if needed
        const wsUrl =
          url.startsWith('wss://') && !url.includes('?')
            ? `${url}?xi-api-key=${encodeURIComponent(this.config.apiKey)}`
            : url;

        this.websocket = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('[11Labs] Connection timeout after 10s');
            reject(new Error('WebSocket connection timeout'));
            this.websocket?.close();
          }
        }, 10000);

        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('[11Labs] WebSocket connected ✓');
          this.isConnected = true;

          // Send initial auth if needed
          if (this.websocket && !url.includes('xi-api-key')) {
            this.websocket.send(
              JSON.stringify({
                type: 'authentication',
                api_key: this.config.apiKey,
                agent_id: this.config.agentId,
              })
            );
          }

          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[11Labs] <<', message.type || 'unknown', message);
            this._handleMessage(message);
          } catch (error) {
            console.error('[11Labs] Parse error:', error, event.data);
          }
        };

        this.websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('[11Labs] WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('[11Labs] WebSocket closed (code:', event.code, 'reason:', event.reason, ')');
          this.isConnected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private _handleMessage(message: Record<string, unknown>) {
    const type = message.type as string;

    switch (type) {
      case 'conversation_initiation_metadata':
        this.conversationId = (message.conversation_id as string) || '';
        console.log('[11Labs] Conversation ID:', this.conversationId);
        break;

      case 'user_transcript':
        {
          const text = (message.user_transcript as string) || '';
          if (text.trim() && this.onMessageCallback) {
            console.log('[11Labs] >> User:', text);
            this.onMessageCallback(text, 'user');
          }
        }
        break;

      case 'agent_response':
        {
          const text = (message.agent_response as string) || '';
          if (text.trim() && this.onMessageCallback) {
            console.log('[11Labs] >> Agent:', text);
            this.onMessageCallback(text, 'agent');
          }
        }
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(true);
        }
        break;

      case 'audio_chunk':
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(true);
        }
        break;

      case 'audio_end':
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(false);
        }
        break;

      case 'interruption':
        console.log('[11Labs] User interrupted');
        break;

      case 'error':
        console.error('[11Labs] Error from agent:', message.error);
        break;

      default:
        console.debug('[11Labs] Message:', type, message);
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.websocket) {
      throw new Error('Conversation not connected');
    }

    // Check credit limits before sending
    const sessionId = this.config.sessionId || 'default';
    if (!useCredits(sessionId, text.length)) {
      const remaining = getCreditsRemaining(sessionId);
      const error = `Credit limit exceeded. 2000 credits max per session. Remaining: ${remaining}`;
      console.error('[11Labs] ' + error);
      throw new Error(error);
    }

    console.log('[11Labs] >> Sending:', text);
    this.websocket.send(
      JSON.stringify({
        type: 'user_input',
        user_input: text,
      })
    );
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      console.log('[11Labs] Disconnecting');
      this.websocket.close();
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
