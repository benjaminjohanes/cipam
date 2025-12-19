import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_participant?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    specialty?: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch other participants' profiles
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantId = conv.participant_1 === user.id 
            ? conv.participant_2 
            : conv.participant_1;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, specialty')
            .eq('id', otherParticipantId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            other_participant: profile,
            last_message: lastMsg,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2: otherUserId
      })
      .select()
      .single();

    if (error) throw error;
    await fetchConversations();
    return data;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { conversations, loading, fetchConversations, createConversation };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();
          
          return { ...msg, sender: profile };
        })
      );

      setMessages(messagesWithSenders);

      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, user]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          setMessages(prev => [...prev, { ...newMessage, sender: profile }]);

          // Mark as read if not from current user
          if (user && newMessage.sender_id !== user.id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return { messages, loading, sendMessage, fetchMessages };
};
