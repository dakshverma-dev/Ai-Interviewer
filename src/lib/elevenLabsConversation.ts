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
      console.log('[11Labs] Initializing with agent:', this.config.agentId);
      console.log('[11Labs] API Key present:', !!this.config.apiKey);

      // Try the standard 11Labs Convai endpoint first
      console.log('[11Labs] Attempting to get signed URL...');

      const signedUrlResponse = await fetch(
        'https://api.elevenlabs.io/convai/conversation/get_signed_url',
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: this.config.agentId,
          }),
        }
      );

      console.log('[11Labs] Signed URL response status:', signedUrlResponse.status);

      if (!signedUrlResponse.ok) {
        const errorBody = await signedUrlResponse.text();
        console.error('[11Labs] Signed URL error:', signedUrlResponse.status, errorBody);

        // If signed URL fails, try direct WebSocket connection
        console.log('[11Labs] Trying direct WebSocket connection...');
        const wsUrl = `wss://api.elevenlabs.io/convai?agent_id=${this.config.agentId}&xi-api-key=${this.config.apiKey}`;
        return this._connectWebSocket(wsUrl);
      }

      const signedUrlData = (await signedUrlResponse.json()) as {
        signed_url?: string;
      };

      if (!signedUrlData.signed_url) {
        console.warn('[11Labs] No signed_url in response, trying direct connection');
        const wsUrl = `wss://api.elevenlabs.io/convai?agent_id=${this.config.agentId}&xi-api-key=${this.config.apiKey}`;
        return this._connectWebSocket(wsUrl);
      }

      console.log('[11Labs] Got signed URL, connecting WebSocket...');
      return this._connectWebSocket(signedUrlData.signed_url);
    } catch (error) {
      console.error('[11Labs] Connection setup failed:', error);
      throw error;
    }
  }

  private _connectWebSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[11Labs] Creating WebSocket connection...');
        this.websocket = new WebSocket(url);

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
