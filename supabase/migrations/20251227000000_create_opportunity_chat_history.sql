-- Chat conversations table
CREATE TABLE public.opportunity_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Chat messages table
CREATE TABLE public.opportunity_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.opportunity_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_opportunity_chats_user_id ON public.opportunity_chats(user_id);
CREATE INDEX idx_opportunity_chats_opportunity_id ON public.opportunity_chats(opportunity_id);
CREATE INDEX idx_opportunity_chat_messages_chat_id ON public.opportunity_chat_messages(chat_id);
CREATE INDEX idx_opportunity_chat_messages_created_at ON public.opportunity_chat_messages(created_at DESC);

-- Row-Level Security
ALTER TABLE public.opportunity_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chats
CREATE POLICY "Users can view their own chats" ON public.opportunity_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON public.opportunity_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON public.opportunity_chats
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view messages from their chats
CREATE POLICY "Users can view their chat messages" ON public.opportunity_chat_messages
  FOR SELECT USING (
    chat_id IN (SELECT id FROM public.opportunity_chats WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in their chats" ON public.opportunity_chat_messages
  FOR INSERT WITH CHECK (
    chat_id IN (SELECT id FROM public.opportunity_chats WHERE user_id = auth.uid())
  );
