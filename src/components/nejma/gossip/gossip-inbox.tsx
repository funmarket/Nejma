"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { ADMIN_WALLET } from '@/lib/nejma/constants';
import { MessageCircle, User, Send, X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export function GossipInbox() {
  const { devbaseClient, user } = useDevapp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Record<string, any>>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const loadMessages = async () => {
    if (!user || !devbaseClient) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sentMessages = await devbaseClient.listEntities('gossip_messages', { fromWallet: user.uid });
      const receivedMessages = await devbaseClient.listEntities('gossip_messages', { toWallet: user.uid });
      const allMessages = [...sentMessages, ...receivedMessages];
      setMessages(allMessages.sort((a, b) => a.createdAt - b.createdAt));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user, devbaseClient]);

  const groupedMessages = useMemo(() => {
    if (!user) return {};
    const groups: Record<string, any[]> = {};
    messages.forEach(msg => {
      const otherWallet = msg.fromWallet === user.uid ? msg.toWallet : msg.fromWallet;
      if (!groups[otherWallet]) groups[otherWallet] = [];
      groups[otherWallet].push(msg);
    });
    return groups;
  }, [messages, user]);

  const conversationList = useMemo(() => {
    return Object.keys(groupedMessages)
      .map(wallet => ({
        wallet,
        lastMessage: groupedMessages[wallet][groupedMessages[wallet].length - 1]
      }))
      .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
  }, [groupedMessages]);

  useEffect(() => {
    const fetchConversationDetails = async () => {
      const newConversations: Record<string, any> = {};
      for(const conv of conversationList) {
        if(conv.wallet === ADMIN_WALLET) {
          newConversations[ADMIN_WALLET] = { username: "NEJMA Support", profilePhotoUrl: null };
        } else {
            const users = await devbaseClient.listEntities('users', { walletAddress: conv.wallet });
            if (users.length > 0) {
              newConversations[conv.wallet] = users[0];
            } else {
              newConversations[conv.wallet] = { username: `${conv.wallet.slice(0, 8)}...`, profilePhotoUrl: null };
            }
        }
      }
      setConversations(newConversations);
    }
    if (conversationList.length > 0) {
        fetchConversationDetails();
    }
  }, [conversationList, devbaseClient]);

  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;
    const tempMessage = newMessage;
    setNewMessage('');
    try {
      await devbaseClient.createEntity('gossip_messages', {
        fromWallet: user.uid,
        toWallet: selectedChat,
        content: tempMessage,
        createdAt: Date.now(),
      });
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(tempMessage);
      addToast('Failed to send message', 'error');
    }
  };

  if (loading) {
    return <div className="space-y-3 pt-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>;
  }
  
  if (selectedChat) {
    return (
        <div>
            <Button onClick={() => setSelectedChat(null)} variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox</Button>
            <Card className="p-4 mb-4 h-96 overflow-y-auto flex flex-col">
                <div className="flex-grow space-y-4">
                {(groupedMessages[selectedChat] || []).map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.fromWallet === user?.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.fromWallet === user?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                </div>
            </Card>
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <Button type="submit" disabled={!newMessage.trim()}><Send size={16} /></Button>
            </form>
        </div>
    )
  }

  return (
    <div className="space-y-3 pt-4">
        <Card onClick={() => setSelectedChat(ADMIN_WALLET)} className="p-4 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20"><MessageCircle size={24} className="text-primary" /></div>
                <div>
                    <p className="font-bold">NEJMA Support</p>
                    <p className="text-sm text-muted-foreground">Get help from the team</p>
                </div>
            </div>
        </Card>
        
        {conversationList.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-12">No messages yet.</p>
        )}

        {conversationList.filter(c=> c.wallet !== ADMIN_WALLET).map(({ wallet, lastMessage }) => (
            <Card key={wallet} onClick={() => setSelectedChat(wallet)} className="p-4 cursor-pointer hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted-foreground/20 overflow-hidden">
                        {conversations[wallet]?.profilePhotoUrl ? <Image src={conversations[wallet].profilePhotoUrl} alt="avatar" width={48} height={48} /> : <User size={24} className="text-muted-foreground" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold truncate">{conversations[wallet]?.username}</p>
                        <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </Card>
        ))}
    </div>
  );
}
