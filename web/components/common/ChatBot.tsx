'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, ExternalLink, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  options?: string[];
}

interface ChatResponse {
  message: string;
  options?: string[];
}

const chatResponses: Record<string, ChatResponse> = {
  welcome: {
    message: "Hi! I'm your Sports Venue Assistant. How can I help you today?",
    options: ['Find venues near me', 'Learn about booking', 'Browse sports', 'Get help'],
  },
  'find venues near me': {
    message: 'Great! I can help you find sports venues nearby. Would you like to see all venues or search by sport?',
    options: ['View all venues', 'Search by sport', 'Filter by price', 'Go back'],
  },
  'learn about booking': {
    message:
      'Booking is easy! You can reserve courts by selecting a venue, choosing a time slot, and confirming your booking.',
    options: ['Make a booking', 'View my bookings', 'Booking policies', 'Go back'],
  },
  'browse sports': {
    message: 'We offer various sports facilities including Tennis, Badminton, Football, Basketball, and more!',
    options: ['View all sports', 'Popular venues', 'Pricing info', 'Go back'],
  },
  'get help': {
    message: 'I can help you navigate the platform, understand booking processes, or answer questions about venues.',
    options: ['Contact support', 'FAQ', 'User guide', 'Go back'],
  },
};

const pageRedirects: Record<string, { path: string; label: string }> = {
  'view all venues': { path: '/venues', label: 'View All Venues' },
  'make a booking': { path: '/user/bookings', label: 'Make a Booking' },
  'view my bookings': { path: '/user/bookings', label: 'My Bookings' },
  'view all sports': { path: '/sports', label: 'Browse Sports' },
  'contact support': { path: '/contact', label: 'Contact Support' },
  faq: { path: '/help', label: 'Help Center' },
  'user guide': { path: '/help', label: 'User Guide' },
  'pricing info': { path: '/pricing', label: 'View Pricing' },
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeResponse = chatResponses.welcome;
      setMessages([
        {
          role: 'assistant',
          content: welcomeResponse.message,
          options: welcomeResponse.options,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleRedirection = (path: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Redirecting you to ${path}...`,
        },
      ]);

      setTimeout(() => {
        window.location.href = path;
      }, 500);
    }, 800);
  };

  const handleOptionClick = (option: string) => {
    const userMessage: Message = {
      role: 'user',
      content: option,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const redirectKey = option.toLowerCase();
    const redirect = pageRedirects[redirectKey];

    if (redirect) {
      handleRedirection(redirect.path);
      return;
    }

    if (option === 'Go back') {
      setTimeout(() => {
        setIsTyping(false);
        const welcomeResponse = chatResponses.welcome;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: welcomeResponse.message,
            options: welcomeResponse.options,
          },
        ]);
      }, 600);
      return;
    }

    if (option === 'Close chat') {
      setIsOpen(false);
      return;
    }

    const responseKey = option.toLowerCase();
    const response = chatResponses[responseKey];

    setTimeout(
      () => {
        setIsTyping(false);

        if (response) {
          const botMessage: Message = {
            role: 'assistant',
            content: response.message,
            options: response.options,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          const fallbackMessage: Message = {
            role: 'assistant',
            content: "I'd be happy to help you with that! Here are some things I can assist you with:",
            options: ['Find venues near me', 'Learn about booking', 'Browse sports', 'Get help', 'Close chat'],
          };
          setMessages((prev) => [...prev, fallbackMessage]);
        }
      },
      Math.random() * 600 + 400
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className='fixed right-6 bottom-6 z-50'>
          {/* Pulse animation ring */}
          <div className='bg-primary/30 absolute inset-0 animate-ping rounded-full' />
          <div className='bg-primary/20 absolute inset-0 animate-pulse rounded-full' />

          <Button
            onClick={() => setIsOpen(true)}
            size='lg'
            className={cn(
              'relative h-16 w-16 rounded-full shadow-2xl',
              'hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-12',
              'from-primary via-primary to-primary/80 bg-gradient-to-br',
              'border-primary-foreground/20 border-2',
              'group overflow-hidden'
            )}
            aria-label='Open chat assistant'
          >
            {/* Shimmer effect */}
            <div className='absolute inset-0 -top-2 -left-2 h-20 w-20 translate-x-[-100%] rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]' />

            <MessageCircle
              size={28}
              className='relative z-10 drop-shadow-sm transition-transform group-hover:scale-110'
            />

            {/* Floating sparkle */}
            <Sparkles size={12} className='text-primary-foreground/60 absolute top-1 right-1 animate-pulse' />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            'animate-in slide-in-from-bottom-5 fade-in-0 fixed right-6 bottom-6 z-50',
            'flex h-[650px] w-[420px] flex-col duration-500',
            'border-border/50 bg-background/95 border shadow-2xl backdrop-blur-xl',
            'before:from-primary/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:to-transparent'
          )}
        >
          {/* Header */}
          <CardHeader
            className={cn(
              'from-primary via-primary to-primary/90 text-primary-foreground relative bg-gradient-to-br',
              'border-primary-foreground/10 rounded-t-xl border-b p-5',
              'before:absolute before:inset-0 before:rounded-t-xl before:bg-gradient-to-r before:from-white/10 before:to-transparent'
            )}
          >
            <div className='relative flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Avatar className='border-primary-foreground/30 h-12 w-12 border-2 shadow-lg'>
                    <AvatarFallback className='bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm'>
                      <Bot size={22} className='animate-pulse' />
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className='border-primary-foreground absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 bg-green-400 shadow-sm' />
                </div>
                <div>
                  <CardTitle className='flex items-center gap-2 text-xl font-bold tracking-tight'>
                    Sports Assistant
                    <Badge
                      variant='secondary'
                      className='bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-2 py-0.5 text-xs'
                    >
                      AI
                    </Badge>
                  </CardTitle>
                  <p className='text-sm font-medium opacity-90'>🏆 Always here to help you win!</p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-primary-foreground hover:bg-primary-foreground/20',
                  'h-9 w-9 rounded-full p-0 transition-all duration-200 hover:scale-110 hover:rotate-90'
                )}
                aria-label='Close chat'
              >
                <X size={20} />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Container */}
          <ScrollArea className='flex-1 px-6'>
            <CardContent className='space-y-6 p-0 py-6'>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'animate-in slide-in-from-bottom-3 fade-in-0 flex duration-500',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn('flex max-w-[90%] items-start gap-3', message.role === 'user' && 'flex-row-reverse')}
                  >
                    <Avatar
                      className={cn(
                        'h-9 w-9 flex-shrink-0 shadow-md transition-transform hover:scale-110',
                        message.role === 'user' ? 'ring-primary/20 ring-2' : 'ring-muted/20 ring-2'
                      )}
                    >
                      <AvatarFallback
                        className={cn(
                          'font-semibold transition-colors',
                          message.role === 'user'
                            ? 'from-primary to-primary/80 text-primary-foreground bg-gradient-to-br'
                            : 'from-muted to-muted/80 text-muted-foreground bg-gradient-to-br'
                        )}
                      >
                        {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'group relative rounded-2xl border p-4 shadow-lg transition-all duration-300 hover:shadow-xl',
                        message.role === 'user'
                          ? 'from-primary to-primary/90 text-primary-foreground border-primary/30 rounded-br-md bg-gradient-to-br'
                          : 'from-card to-card/80 text-card-foreground border-border/50 rounded-bl-md bg-gradient-to-br backdrop-blur-sm'
                      )}
                    >
                      {/* Message shine effect */}
                      <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

                      <p className='relative text-sm leading-relaxed font-medium'>{message.content}</p>

                      {message.options && message.role === 'assistant' && (
                        <>
                          <Separator className='my-4 opacity-30' />
                          <div className='relative flex flex-col gap-2.5'>
                            {message.options.map((option: string, optionIndex: number) => {
                              const isRedirectOption = Object.values(pageRedirects).some(
                                (redirect) => redirect.label === option
                              );

                              return (
                                <Button
                                  key={optionIndex}
                                  variant={isRedirectOption ? 'default' : 'outline'}
                                  size='sm'
                                  onClick={() => handleOptionClick(option)}
                                  className={cn(
                                    'group/btn relative h-auto justify-between overflow-hidden p-3 text-left whitespace-normal',
                                    'transition-all duration-300 hover:scale-[1.02] hover:shadow-md',
                                    'before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
                                    isRedirectOption &&
                                      'from-primary/20 via-primary/15 to-primary/20 hover:from-primary/30 hover:via-primary/25 hover:to-primary/30 text-primary border-primary/40 bg-gradient-to-r shadow-sm'
                                  )}
                                >
                                  <span className='relative flex-1 font-medium'>{option}</span>
                                  {isRedirectOption && (
                                    <Badge
                                      variant='secondary'
                                      className='bg-primary/10 text-primary border-primary/30 relative ml-2 px-2 py-1 transition-transform group-hover/btn:scale-110'
                                    >
                                      <ExternalLink size={12} />
                                    </Badge>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced Typing Indicator */}
              {isTyping && (
                <div className='animate-in slide-in-from-bottom-2 fade-in-0 flex justify-start duration-300'>
                  <div className='flex max-w-[90%] items-start gap-3'>
                    <Avatar className='ring-muted/20 h-9 w-9 flex-shrink-0 shadow-md ring-2'>
                      <AvatarFallback className='from-muted to-muted/80 text-muted-foreground bg-gradient-to-br'>
                        <Bot size={18} className='animate-pulse' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='from-card to-card/80 text-card-foreground border-border/50 relative rounded-2xl rounded-bl-md border bg-gradient-to-br p-4 shadow-lg backdrop-blur-sm'>
                      <div className='flex space-x-1.5'>
                        <div
                          className='bg-primary/60 h-2.5 w-2.5 animate-bounce rounded-full shadow-sm'
                          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                        />
                        <div
                          className='bg-primary/60 h-2.5 w-2.5 animate-bounce rounded-full shadow-sm'
                          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                        />
                        <div
                          className='bg-primary/60 h-2.5 w-2.5 animate-bounce rounded-full shadow-sm'
                          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                        />
                      </div>
                      {/* Pulse ring around typing indicator */}
                      <div className='bg-primary/5 absolute inset-0 animate-pulse rounded-2xl' />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </ScrollArea>

          {/* Enhanced Footer */}
          <div
            className={cn(
              'from-muted/40 via-muted/20 to-muted/40 relative bg-gradient-to-r backdrop-blur-xl',
              'border-border/50 rounded-b-xl border-t p-5',
              'flex items-center justify-between',
              'before:from-primary/5 before:absolute before:inset-0 before:rounded-b-xl before:bg-gradient-to-r before:to-transparent'
            )}
          >
            <div className='relative flex items-center gap-2'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-sm' />
              <span className='text-muted-foreground text-xs font-medium'>Choose an option to continue</span>
            </div>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                setMessages([]);
                setIsTyping(false);
                setTimeout(() => {
                  const welcomeResponse = chatResponses.welcome;
                  setMessages([
                    {
                      role: 'assistant',
                      content: welcomeResponse.message,
                      options: welcomeResponse.options,
                    },
                  ]);
                }, 100);
              }}
              className={cn(
                'group relative h-8 overflow-hidden px-4 text-xs font-semibold',
                'transition-all duration-300 hover:scale-105 hover:shadow-md',
                'from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary bg-gradient-to-r'
              )}
            >
              {/* Button shimmer effect */}
              <div className='absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]' />
              <span className='relative'>🔄 Reset Chat</span>
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
