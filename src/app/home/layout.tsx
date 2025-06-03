"use client";
import { Page } from '@/components/Page';
import { FixedLayout, Tabbar, Text } from '@telegram-apps/telegram-ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';
// Icons – feel free to swap for your own SVGs or Telegram‑UI icons
import { Compass, MessagesSquare, Search, UserCircle, Users, Video } from 'lucide-react';
import { BlurIn } from '@/components/animation/BlurIn';

// -----------------------------------------------------------------------------
// Tab configuration — add / remove items here to update menu + routing + titles
// -----------------------------------------------------------------------------

export interface TabConfig {
  id: string;
  path: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const TABS: TabConfig[] = [
  { id: 'discover', path: '/home/discover', label: 'Discover', Icon: Compass },
  { id: 'matches',  path: '/home/matches',  label: 'Matches',  Icon: MessagesSquare },
  { id: 'explore',  path: '/home/explore',  label: 'Explore',  Icon: Search },
  { id: 'live',     path: '/home/live',     label: 'Live',     Icon: Video },
  { id: 'profile',  path: '/home/profile',  label: 'Profile',  Icon: UserCircle },
];

type TabId = typeof TABS[number]['id'];

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = React.useState<TabId>('discover');

  // Keep <title> in sync with the active tab
  React.useEffect(() => {
    const active = TABS.find(t => t.id === currentTab);
    if (active) document.title = active.label;
  }, [currentTab]);

  // Navigate + animate on tab click
  const handleTabClick = (id: TabId, route: string) => {
    setCurrentTab(id);
    router.push(route);
  };

  const ActiveIcon = TABS.find(t => t.id === currentTab)?.Icon ?? Compass;
  const activeText = TABS.find(t => t.id === currentTab)?.label ?? '';

  return (
    <Page back={false}>
      <div className="w-full h-screen flex flex-col">
        {/* ───────────────────────── Top (Title) */}
        <FixedLayout className='telegram-bg-color z-50 top-bar-height-padding-top' vertical="top" style={{ padding: 16 }}>
          <BlurIn key={currentTab}>
            <span className="flex items-center justify-center gap-2">
              <ActiveIcon color="#1FB6A8" className="w-6 h-6" />
              <Text weight="1">{activeText}</Text>
            </span>
          </BlurIn>
        </FixedLayout>

        {/* ───────────────────────── Main scroll area */}
        <div className="flex-1 overflow-auto pt-[72px] pb-[80px]">
          {children}
        </div>

        {/* ───────────────────────── Bottom Tabbar */}
        <FixedLayout vertical="bottom" style={{ padding: 16 }}>
          <Tabbar className='pb-5 pb-3'>
            {TABS.map(({ id, label, Icon, path }) => (
              <Tabbar.Item
                key={id}
                text={label}
                selected={id === currentTab}
                onClick={() => handleTabClick(id, path)}
              >
                <Icon className="w-6 h-6" />
              </Tabbar.Item>
            ))}
          </Tabbar>
        </FixedLayout>
      </div>
    </Page>
  );
}
