/**
 * Verisource Ava Voice Assistant Service
 * 
 * Provides Web Speech Recognition (Speech-to-Text) and Speech Synthesis (Text-to-Speech)
 * with graceful browser fallbacks, animated listening states, and natural audio synthesis.
 */

export interface SpeechRecognitionCallbacks {
  onInterim?: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceAssistantServiceImpl {
  private recognition: any = null;
  private isListeningActive = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
      } catch (err) {
        console.warn('[VoiceAssistant] Failed to initialize SpeechRecognition:', err);
        this.recognition = null;
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public isTextToSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean('speechSynthesis' in window && window.speechSynthesis);
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public startListening(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser environment.');
      return false;
    }

    // Stop speaking if Ava was speaking
    this.stopSpeaking();

    try {
      this.recognition.onstart = () => {
        this.isListeningActive = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (interimTranscript && callbacks.onInterim) {
          callbacks.onInterim(interimTranscript);
        }

        if (finalTranscript) {
          this.isListeningActive = false;
          callbacks.onFinal(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListeningActive = false;
        console.warn('[VoiceAssistant] Speech recognition error:', event.error);
        callbacks.onError?.(event.error || 'Speech input error');
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListeningActive = false;
      console.warn('[VoiceAssistant] Could not start speech recognition:', err);
      callbacks.onError?.(err.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListeningActive = false;
    }
  }

  public speak(
    text: string, 
    callbacks?: { onStart?: () => void; onEnd?: () => void }
  ): boolean {
    if (!this.isTextToSpeechSupported()) return false;

    this.stopSpeaking();

    // Clean markdown formatting before speaking aloud
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/[#*_`~>-]/g, '')     // remove markdown syntax symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link text
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    // Speak first 2-3 sentences to keep voice output punchy and crisp
    const sentences = cleanText.split(/(?<=[.?!])\s+/);
    const spokenSnippet = sentences.slice(0, 3).join(' ');

    try {
      const utterance = new SpeechSynthesisUtterance(spokenSnippet);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Ava')) && 
        v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeakingActive = true;
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        callbacks?.onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeakingActive = false;
        callbacks?.onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('[VoiceAssistant] Speech synthesis error:', e);
      return false;
    }
  }

  public stopSpeaking() {
    if (this.isTextToSpeechSupported() && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.isSpeakingActive = false;
    }
  }
}

export const VoiceAssistantService = new VoiceAssistantServiceImpl();

