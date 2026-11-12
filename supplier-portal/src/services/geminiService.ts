/**
 * Verisource Client-Side Copilot Gateway
 * 
 * Proxies prompts directly to the secure backend Gemini AI Copilot endpoint (/api/v1/ai/copilot-chat).
 * Supports both real-time token/word streaming and non-streaming responses.
 */

import { PageAction } from './pageActionBridge.js';
import { BASE_URL } from '../api/client.js';

export interface GeminiPromptOptions {
  prompt: string;
  currentRoute: string;
  pageContextData?: Record<string, any>;
  history?: Array<{ sender: 'USER' | 'AVA'; text: string }>;
}

export interface GeminiResponseResult {
  text: string;
  actions: PageAction[];
  partialViews?: any[];
  isLiveGemini: boolean;
  modelUsed?: string;
  error?: string;
}

export interface GeminiStreamCallbacks {
  onThinking?: (step: string) => void;
  onChunk: (chunk: string, accumulatedText: string) => void;
  onDone: (result: GeminiResponseResult) => void;
  onError?: (err: Error) => void;
}

/**
 * Send user prompt to backend copilot service (non-streaming)
 */
export async function sendGeminiPrompt(options: GeminiPromptOptions): Promise<GeminiResponseResult> {
  const { prompt, currentRoute, pageContextData, history = [] } = options;

  try {
    const response = await fetch(`${BASE_URL}/ai/copilot-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-portal-type': 'supplier',
        'x-simulated-user-id': 'user-supp-acme'
      },
      body: JSON.stringify({
        prompt,
        message: prompt,
        currentRoute,
        pageContextData,
        history: history.slice(-6)
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        text: data.reply || data.text || 'Response received.',
        actions: data.actions || [],
        partialViews: data.partialViews || [],
        isLiveGemini: Boolean(data.isLiveGemini),
        modelUsed: data.modelUsed
      };
    } else {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error || `Server responded with ${response.status}`;
      console.warn('[Copilot Service] Backend returned error:', errMsg);
      return {
        text: `Ava Copilot: ${errMsg}`,
        actions: [],
        isLiveGemini: false,
        error: errMsg
      };
    }
  } catch (err: any) {
    console.error('[Copilot Service] Failed to reach backend:', err);
    return {
      text: `Unable to connect to backend AI service. Please ensure the server is running on port 3001.`,
      actions: [],
      isLiveGemini: false,
      error: err.message
    };
  }
}

/**
 * Send user prompt with real-time SSE token streaming and thinking step callbacks
 */
export async function sendGeminiPromptStream(
  options: GeminiPromptOptions,
  callbacks: GeminiStreamCallbacks
): Promise<void> {
  const { prompt, currentRoute, pageContextData, history = [] } = options;

  try {
    const response = await fetch(`${BASE_URL}/ai/copilot-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'x-portal-type': 'supplier',
        'x-simulated-user-id': 'user-supp-acme'
      },
      body: JSON.stringify({
        prompt,
        message: prompt,
        currentRoute,
        pageContextData,
        history: history.slice(-6),
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      // Fallback to non-streaming if stream not accepted
      const nonStreamResult = await sendGeminiPrompt(options);
      callbacks.onChunk(nonStreamResult.text, nonStreamResult.text);
      callbacks.onDone(nonStreamResult);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'thinking' && data.text) {
              callbacks.onThinking?.(data.text);
            } else if (data.type === 'chunk' && data.text) {
              accumulatedText += data.text;
              callbacks.onChunk(data.text, accumulatedText);
            } else if (data.type === 'done') {
              callbacks.onDone({
                text: data.text || accumulatedText,
                actions: data.actions || [],
                partialViews: data.partialViews || [],
                isLiveGemini: Boolean(data.isLiveGemini),
                modelUsed: data.modelUsed
              });
              return;
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Streaming error');
            }
          } catch (e: any) {
            // Partial json chunk, continue buffer
          }
        }
      }
    }

    // End of stream
    callbacks.onDone({
      text: accumulatedText,
      actions: [],
      isLiveGemini: true
    });
  } catch (err: any) {
    console.warn('[Copilot Service] Streaming failed, falling back to synchronous prompt:', err);
    try {
      const fallbackResult = await sendGeminiPrompt(options);
      callbacks.onChunk(fallbackResult.text, fallbackResult.text);
      callbacks.onDone(fallbackResult);
    } catch (fallbackErr: any) {
      callbacks.onError?.(fallbackErr);
    }
  }
}
