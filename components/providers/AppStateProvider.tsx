'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import dayjs from 'dayjs';

import { loadState, persistState } from '@/lib/storage';
import type { AppState, ChatMessage, Conversation, PreferenceState } from '@/lib/types';

type AppAction =
  | { type: 'hydrate'; payload: AppState }
  | { type: 'start-conversation'; payload: { conversation: Conversation } }
  | { type: 'set-active'; payload: { conversationId: string } }
  | { type: 'add-message'; payload: { conversationId: string; message: ChatMessage } }
  | { type: 'update-preferences'; payload: Partial<PreferenceState> }
  | { type: 'clear-history' }
  | { type: 'delete-conversation'; payload: { conversationId: string } }
  | { type: 'mark-spoken'; payload: { conversationId: string; messageId: string } }
  | { type: 'rename-conversation'; payload: { conversationId: string; title: string } };

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const defaultConversation: Conversation = {
  id: createId(),
  title: 'First Companion Session',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: createId(),
      role: 'assistant',
      content:
        'Hello! I am your calm-focused companion. Ask me about well-being, crops, technology, or anything else on your mind.',
      timestamp: new Date().toISOString()
    }
  ]
};

const defaultPreferences: PreferenceState = {
  theme: 'system',
  voiceURI: null,
  voiceVolume: 1,
  voiceRate: 1,
  voicePitch: 1,
  enableHaptics: true,
  enableNotifications: false,
  enableAutoSpeak: false,
  fontScale: 1
};

const initialState: AppState = {
  conversations: [defaultConversation],
  activeConversationId: defaultConversation.id,
  preferences: defaultPreferences
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'hydrate': {
      return action.payload;
    }
    case 'start-conversation': {
      return {
        ...state,
        conversations: [action.payload.conversation, ...state.conversations],
        activeConversationId: action.payload.conversation.id
      };
    }
    case 'set-active': {
      return { ...state, activeConversationId: action.payload.conversationId };
    }
    case 'add-message': {
      const conversations = state.conversations.map(convo => {
        if (convo.id !== action.payload.conversationId) return convo;
        return {
          ...convo,
          messages: [...convo.messages, action.payload.message],
          updatedAt: action.payload.message.timestamp
        };
      });
      return { ...state, conversations };
    }
    case 'update-preferences': {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };
    }
    case 'clear-history': {
      const freshConversation: Conversation = {
        id: createId(),
        title: 'New Session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      return {
        ...state,
        conversations: [freshConversation],
        activeConversationId: freshConversation.id
      };
    }
    case 'delete-conversation': {
      const filtered = state.conversations.filter(c => c.id !== action.payload.conversationId);
      const fallback = filtered[0]?.id ?? null;
      return {
        ...state,
        conversations: filtered.length ? filtered : state.conversations,
        activeConversationId: fallback
      };
    }
    case 'mark-spoken': {
      return {
        ...state,
        conversations: state.conversations.map(convo => {
          if (convo.id !== action.payload.conversationId) return convo;
          return {
            ...convo,
            messages: convo.messages.map(msg =>
              msg.id === action.payload.messageId ? { ...msg, spoken: true } : msg
            )
          };
        })
      };
    }
    case 'rename-conversation': {
      return {
        ...state,
        conversations: state.conversations.map(convo =>
          convo.id === action.payload.conversationId
            ? { ...convo, title: action.payload.title }
            : convo
        )
      };
    }
    default:
      return state;
  }
};

interface AppStateContextValue extends AppState {
  startConversation: (title: string, initialMessage?: ChatMessage) => Conversation;
  sendMessage: (content: string, role?: 'user' | 'assistant', conversationId?: string) => ChatMessage;
  setActiveConversation: (conversationId: string) => void;
  updatePreferences: (preferences: Partial<PreferenceState>) => void;
  clearHistory: () => void;
  exportConversation: (conversationId: string) => string | null;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const usePersistedReducer = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const stored = loadState();
    if (stored) {
      dispatch({ type: 'hydrate', payload: stored });
    }
  }, []);

  useEffect(() => {
    persistState(state);
  }, [state]);

  return { state, dispatch } as const;
};

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, dispatch } = usePersistedReducer();

  const setActiveConversation = useCallback(
    (conversationId: string) => dispatch({ type: 'set-active', payload: { conversationId } }),
    [dispatch]
  );

  const startConversation = useCallback(
    (title: string, initialMessage?: ChatMessage) => {
      const conversation: Conversation = {
        id: createId(),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: initialMessage ? [initialMessage] : []
      };
      dispatch({ type: 'start-conversation', payload: { conversation } });
      return conversation;
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    (content: string, role: 'user' | 'assistant' = 'user', conversationId?: string) => {
      const targetId = conversationId ?? state.activeConversationId ?? startConversation('New Session').id;
      const message: ChatMessage = {
        id: createId(),
        role,
        content,
        timestamp: new Date().toISOString()
      };
      dispatch({ type: 'add-message', payload: { conversationId: targetId, message } });
      return message;
    },
    [dispatch, startConversation, state.activeConversationId]
  );

  const updatePreferences = useCallback(
    (preferences: Partial<PreferenceState>) =>
      dispatch({ type: 'update-preferences', payload: preferences }),
    [dispatch]
  );

  const clearHistory = useCallback(() => dispatch({ type: 'clear-history' }), [dispatch]);

  const exportConversation = useCallback(
    (conversationId: string) => {
      const conversation = state.conversations.find(convo => convo.id === conversationId);
      if (!conversation) return null;
      const exportPayload = {
        ...conversation,
        exportedAt: dayjs().toISOString()
      };
      return JSON.stringify(exportPayload, null, 2);
    },
    [state.conversations]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      startConversation,
      sendMessage,
      setActiveConversation,
      updatePreferences,
      clearHistory,
      exportConversation
    }),
    [clearHistory, exportConversation, sendMessage, setActiveConversation, startConversation, state, updatePreferences]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
