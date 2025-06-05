'use client';
import { useState, useRef } from 'react';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';
import {
  Avatar,
  Badge,
  Button,
  Cell,
  Divider,
  List,
  Tooltip,
  Text, // For rendering the action labels
} from '@telegram-apps/telegram-ui';
import { MoreVertical } from 'lucide-react'; // You can swap this icon for any “⋮” SVG

type Chat = {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
};

const mockChats: Chat[] = [
  {
    id: 'chat1',
    name: 'Alice Johnson',
    avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
    lastMessage: 'Hey! Are you coming tonight?',
    timestamp: '10:24 AM',
  },
  {
    id: 'chat2',
    name: 'Bob Smith',
    avatarUrl: 'https://randomuser.me/api/portraits/men/34.jpg',
    lastMessage: "Let's catch up tomorrow.",
    timestamp: 'Yesterday',
  },
  {
    id: 'chat3',
    name: 'Catherine Zhang',
    avatarUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    lastMessage: 'Sent you the files.',
    timestamp: 'Jun 4',
  },
  {
    id: 'chat4',
    name: 'David Lee',
    avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg',
    lastMessage: '😂😂😂 that was hilarious',
    timestamp: 'Jun 2',
  },
  {
    id: 'chat5',
    name: 'Eva Müller',
    avatarUrl: 'https://randomuser.me/api/portraits/women/67.jpg',
    lastMessage: 'See you at 3 PM.',
    timestamp: 'Jun 1',
  },
];

export default function MatchesPage() {
  // Track which chat’s tooltip is open (by id), or null if none.
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  // For each chat, we need a ref to its “⋮” button, so that Tooltip can anchor to it.
  // We'll store a map from chatId → React ref object.
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleAction = (chatId: string, action: 'block' | 'report' | 'delete' | 'favorite') => {
    // Close the tooltip immediately
    setOpenTooltipId(null);

    switch (action) {
      case 'block':
        alert(`Blocking user in chat "${chatId}"`);
        break;
      case 'report':
        alert(`Reporting chat "${chatId}"`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this chat?')) {
          alert(`Deleted chat "${chatId}"`);
          // In a real app, remove chat from your data source and re-render.
        }
        break;
      case 'favorite':
        alert(`Added chat "${chatId}" to favorites`);
        break;
    }
  };

  return (
    <Page back={false}>
      <List
        style={{
          background: 'var(--tgui--secondary_bg_color)',
        }}
      >
        {/* Wrap all rows in a single container for a consistent white bg */}
        <div style={{ background: 'var(--tgui--bg_color)' }}>
          {mockChats.map((chat, idx) => {
            // Create (or reuse) a ref object for this chat’s ⋮ button:
            if (!buttonRefs.current[chat.id]) {
              buttonRefs.current[chat.id] = null;
            }

            return (
              <div key={chat.id}>
                <Cell
                  before={<Avatar size={48} src={chat.avatarUrl} />}
                  after={
                    <Button
                      ref={(el) => {
                        // @ts-ignore
                        buttonRefs.current[chat.id] = el;
                      }}
                      style={{ width: 32, height: 32, padding: 0, minWidth: 32 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle tooltip for this chat
                        setOpenTooltipId((prev) => (prev === chat.id ? null : chat.id));
                      }}
                    >
                      <MoreVertical size={20} />
                    </Button>
                  }
                  title={chat.name}
                  subtitle={chat.lastMessage}
                  description={chat.timestamp}
                  interactiveAnimation="opacity"
                  titleBadge={<Badge type="dot" />}
                />

                {/* Divider between items, except after the last one */}
                {idx < mockChats.length - 1 && <Divider />}

                {/* Tooltip: only render if this chat’s id matches openTooltipId */}
                {openTooltipId === chat.id && (
                  <BlurIn>
                    <Tooltip targetRef={{ current: buttonRefs.current[chat.id] }}>
                      <List
                        style={{
                          // Ensure the tooltip’s dropdown is not too wide
                          minWidth: 140,
                          padding: '4px 0',
                        }}
                      >
                        <Cell
                          onClick={() => handleAction(chat.id, 'block')}
                        >
                          Block
                        </Cell>
                        <Cell
                          onClick={() => handleAction(chat.id, 'report')}
                        >
                          Report
                        </Cell>
                        <Cell
                          onClick={() => handleAction(chat.id, 'delete')}
                        >
                          Delete Chat
                        </Cell>
                        <Cell
                          onClick={() => handleAction(chat.id, 'favorite')}
                        >
                          Add to Favorite
                        </Cell>
                      </List>
                    </Tooltip>
                  </BlurIn>
                )}
              </div>
            );
          })}
        </div>
      </List>
    </Page>
  );
}
