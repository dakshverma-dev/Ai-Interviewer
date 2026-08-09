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
  private sessionToken: string = '';
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
      // Get session token from 11Labs
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
        throw new Error(`Failed to get session token: ${response.statusText}`);
      }

      const data = (await response.json()) as { signed_url: string };
      const signedUrl = data.signed_url;

      // Connect to WebSocket
      this.websocket = new WebSocket(signedUrl);

      this.websocket.onopen = () => {
        console.log('Connected to 11Labs conversation');
        this.isConnected = true;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this._handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };

      this.websocket.onclose = () => {
        console.log('Disconnected from 11Labs conversation');
        this.isConnected = false;
      };

      // Wait for connection to establish
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        const checkConnection = setInterval(() => {
          if (this.isConnected) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            resolve();
          }
        }, 100);
      });
    } catch (error) {
      console.error('Failed to connect to 11Labs:', error);
      throw error;
    }
  }

  private _handleMessage(message: Record<string, unknown>) {
    const type = message.type as string;

    switch (type) {
      case 'conversation_initiation_metadata':
        this.conversationId = (message.conversation_id as string) || '';
        this.sessionToken = (message.session_token as string) || '';
        console.log('Conversation initiated:', this.conversationId);
        break;

      case 'user_transcript':
        if (this.onMessageCallback) {
          const text = (message.user_transcript as string) || '';
          if (text.trim()) {
            this.onMessageCallback(text, 'user');
          }
        }
        break;

      case 'agent_response':
        if (this.onMessageCallback) {
          const text = (message.agent_response as string) || '';
          if (text.trim()) {
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
        console.log('User interrupted agent');
        break;

      case 'error':
        console.error('11Labs error:', message.error);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected || !this.websocket) {
      throw new Error('Conversation not connected');
    }

    this.websocket.send(
      JSON.stringify({
        type: 'user_input',
        user_input: text,
      })
    );
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
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
