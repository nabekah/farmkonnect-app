import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingPosition {
  x: number;
  y: number;
}

export function FloatingElements() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatPos, setChatPos] = useState<FloatingPosition>({ x: 20, y: 20 });
  const [draggingChat, setDraggingChat] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle chat dragging
  const handleChatMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDraggingChat(true);
    setDragOffset({
      x: e.clientX - chatPos.x,
      y: e.clientY - chatPos.y,
    });
  };



  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingChat) {
        setChatPos({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 300)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 400)),
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingChat(false);
    };

    if (draggingChat) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingChat, dragOffset]);

  return (
    <>
      {/* Chat Button - Draggable */}
      <div
        className="fixed z-50 cursor-move select-none"
        style={{
          left: `${chatPos.x}px`,
          top: `${chatPos.y}px`,
        }}
        onMouseDown={handleChatMouseDown}
      >
        {!chatOpen ? (
          <Button
            onClick={() => setChatOpen(true)}
            className="rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all"
            title="Open Chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden w-80">
            {/* Chat Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Support Chat</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatMinimized(!chatMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {chatMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!chatMinimized && (
              <div className="h-80 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-background/50">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-xs text-sm">
                        Welcome to FarmKonnect Support! How can we help you today?
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-3 bg-background">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      className="px-3"
                      onClick={() => {
                        // Handle message send
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint Text */}
      {draggingChat && (
        <div className="fixed bottom-4 left-4 bg-foreground text-background px-3 py-2 rounded text-sm z-40 pointer-events-none">
          Drag to reposition
        </div>
      )}
    </>
  );
}
