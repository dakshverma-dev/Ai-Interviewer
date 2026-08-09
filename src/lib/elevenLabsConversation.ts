'use client';

export interface ConversationConfig {
  apiKey: string;
  agentId: string;
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
      console.log('[11Labs] Connecting with agent ID:', this.config.agentId);

      // Get session token from 11Labs using the correct endpoint
      const response = await fetch('https://api.elevenlabs.io/convai/conversation/get_signed_url', {
        method: 'POST',
        headers: {
          'xi-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: this.config.agentId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[11Labs] Error response:', response.status, errorText);
        throw new Error(`Failed to get signed URL: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as { signed_url?: string };
      if (!data.signed_url) {
        throw new Error('No signed_url in response');
      }

      const signedUrl = data.signed_url;
      console.log('[11Labs] Got signed URL, connecting WebSocket...');

      // Connect to WebSocket with the signed URL
      return new Promise((resolve, reject) => {
        try {
          this.websocket = new WebSocket(signedUrl);

          this.websocket.onopen = () => {
            console.log('[11Labs] WebSocket connected ✓');
            this.isConnected = true;
            resolve();
          };

          this.websocket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              console.log('[11Labs] Message received:', message.type);
              this._handleMessage(message);
            } catch (error) {
              console.error('[11Labs] Failed to parse message:', error, event.data);
            }
          };

          this.websocket.onerror = (error) => {
            console.error('[11Labs] WebSocket error:', error);
            this.isConnected = false;
            reject(error);
          };

          this.websocket.onclose = () => {
            console.log('[11Labs] WebSocket closed');
            this.isConnected = false;
          };

          // Timeout if connection doesn't establish
          setTimeout(() => {
            if (!this.isConnected) {
              reject(new Error('WebSocket connection timeout'));
            }
          }, 10000);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('[11Labs] Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private _handleMessage(message: Record<string, unknown>) {
    const type = message.type as string;

    switch (type) {
      case 'conversation_initiation_metadata':
        this.conversationId = (message.conversation_id as string) || '';
        console.log('[11Labs] Conversation initiated:', this.conversationId);
        break;

      case 'user_transcript':
        if (this.onMessageCallback) {
          const text = (message.user_transcript as string) || '';
          if (text.trim()) {
            console.log('[11Labs] User transcript:', text);
            this.onMessageCallback(text, 'user');
          }
        }
        break;

      case 'agent_response':
        if (this.onMessageCallback) {
          const text = (message.agent_response as string) || '';
          if (text.trim()) {
            console.log('[11Labs] Agent response:', text);
            this.onMessageCallback(text, 'agent');
          }
        }
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(true);
        }
        break;

      case 'audio_chunk':
        // Audio is being played
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(true);
        }
        break;

      case 'audio_end':
        // Audio finished
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(false);
        }
        break;

      case 'interruption':
        console.log('[11Labs] User interrupted agent');
        break;

      case 'error':
        console.error('[11Labs] Agent error:', message.error);
        break;

      default:
        console.debug('[11Labs] Message type:', type, message);
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.websocket) {
      throw new Error('Conversation not connected');
    }

    console.log('[11Labs] Sending message:', text);
    this.websocket.send(
      JSON.stringify({
        type: 'user_input',
        user_input: text,
      })
    );
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      console.log('[11Labs] Disconnecting...');
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
