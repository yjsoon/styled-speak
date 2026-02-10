import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { streamChat, type Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PERSONALITY = "extreme Phua Chu Kang enthusiast";

const PERSONALITY_PRESETS = [
  { label: "🏗️ Phua Chu Kang", value: "extreme Phua Chu Kang enthusiast who talks like PCK with Singlish, always says 'use your brain!', 'don't play play!', and 'best in Singapore, JB, and some say Batam'" },
  { label: "🧙 Gandalf", value: "Gandalf from Lord of the Rings — wise, cryptic, occasionally stern, with a dry sense of humour" },
  { label: "🏴‍☠️ Pirate", value: "a flamboyant pirate captain who speaks in old nautical slang, loves treasure, and ends sentences with 'arrr'" },
  { label: "🤖 Sarcastic AI", value: "a hyper-intelligent AI who is deeply sarcastic and passive-aggressive, but ultimately helpful" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState(PERSONALITY_PRESETS[0].value);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        personality,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Chat Error",
            description: error,
          });
        },
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the chat service.",
      });
    }
  };

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setPersonality(PERSONALITY_PRESETS[index].value);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-bold text-foreground truncate">
            Personality Chat
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {PERSONALITY_PRESETS[selectedPreset].label}
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </header>

      {/* Personality selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-border bg-card/40">
        {PERSONALITY_PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => handlePresetChange(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedPreset === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm max-w-[250px]">
                Pick a personality above and start chatting! The bot will stay in character.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="bg-chat-bot rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
