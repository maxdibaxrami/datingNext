'use client';

import { useState } from 'react';
import { Page } from '@/components/Page';
import { Card, Button } from '@telegram-apps/telegram-ui';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Heart, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';

const users = [
  { name: 'Emily', age: 26, city: 'New York', images: ['https://i.imgur.com/892vhef.jpeg', 'https://i.imgur.com/AjvKPVT.jpeg'] },
  { name: 'Lucas', age: 24, city: 'Los Angeles', images: ['https://i.imgur.com/xeoJ6qF.jpeg', 'https://i.imgur.com/AjvKPVT.jpeg'] },
  { name: 'Sophia', age: 22, city: 'Chicago', images: ['https://i.imgur.com/AjvKPVT.jpeg', 'https://i.imgur.com/892vhef.jpeg'] },
  { name: 'Noah', age: 27, city: 'Houston', images: ['https://i.imgur.com/892vhef.jpeg', 'https://i.imgur.com/xeoJ6qF.jpeg'] },
  { name: 'Olivia', age: 25, city: 'Miami', images: ['https://i.imgur.com/xeoJ6qF.jpeg'] },
  { name: 'Ava', age: 23, city: 'San Francisco', images: ['https://i.imgur.com/AjvKPVT.jpeg'] },
  { name: 'Mason', age: 29, city: 'Seattle', images: ['https://i.imgur.com/892vhef.jpeg'] },
  { name: 'Mia', age: 28, city: 'Dallas', images: ['https://i.imgur.com/xeoJ6qF.jpeg'] },
  { name: 'Ethan', age: 30, city: 'Boston', images: ['https://i.imgur.com/892vhef.jpeg'] },
  { name: 'Charlotte', age: 21, city: 'Denver', images: ['https://i.imgur.com/AjvKPVT.jpeg'] },
];

// Card stack animation values
const CARD_OFFSET = 16; // How much to shift each card down/back
const CARD_SCALE = 0.96; // How much to scale each card back

export default function DiscoverPage() {
  const [profileIndex, setProfileIndex] = useState(0);
  const [dragging, setDragging] = useState<'left' | 'right' | false>(false);
  const [imageIndexes, setImageIndexes] = useState(Array(users.length).fill(0));

  // Handle Swiper image change per card
  const handleSlideChange = (swiper: any, idx: number) => {
    setImageIndexes((prev: number[]) => {
      const copy = [...prev];
      copy[idx] = swiper.activeIndex;
      return copy;
    });
  };

  // Button click = animate out
  const triggerSwipe = (dir: 'left' | 'right') => {
    setDragging(dir);
    setTimeout(() => {
      setDragging(false);
      setProfileIndex(i => Math.min(i + 1, users.length));
    }, 250); // matches card fly-out animation
  };

  // Drag logic
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 120) {
      triggerSwipe('right');
    } else if (info.offset.x < -120) {
      triggerSwipe('left');
    }
  };

  // "No more profiles"
  if (profileIndex >= users.length) {
    return (
      <Page back={false}>
        <div className="flex h-screen items-center justify-center text-2xl text-gray-500">
          No more profiles! 👏
        </div>
      </Page>
    );
  }

  // Show top two cards: current and next
  const topTwo = users.slice(profileIndex, profileIndex + 2);

  return (
    <Page back={false}>
      <div className="flex h-screen items-center justify-center relative">
        {/* Card Stack */}
        <div className="relative w-[300px] h-[500px]">
          {topTwo.map((profile, i) => {
            const isTop = i === 0;
            const idx = profileIndex + i;

            return (
              <AnimatePresence key={profile.name + idx}>
                <motion.div
                  key={profile.name + idx}
                  className={`absolute w-full h-full`}
                  style={{
                    zIndex: isTop ? 2 : 1,
                  }}
                  initial={{
                    scale: isTop ? 1 : CARD_SCALE,
                    y: isTop ? 0 : CARD_OFFSET,
                    opacity: 1,
                  }}
                  animate={{
                    scale: isTop ? 1 : CARD_SCALE,
                    y: isTop ? 0 : CARD_OFFSET,
                    opacity: 1,
                  }}
                  exit={
                    isTop
                      ? (dragging
                        ? { x: dragging === 'right' ? 600 : -600, opacity: 0, rotate: dragging === 'right' ? 24 : -24, transition: { duration: 0.25 } }
                        : { opacity: 0, transition: { duration: 0.15 } })
                      : {}
                  }
                >
                  <motion.div
                    className="w-full h-full"
                    drag={isTop ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={isTop ? handleDragEnd : undefined}
                    whileTap={{ scale: 1.02 }}
                    whileDrag={isTop ? { scale: 1.02, rotate: 6 } : {}}
                    animate={{
                      boxShadow: isTop
                        ? '0 8px 32px rgba(0,0,0,0.18)'
                        : '0 4px 16px rgba(0,0,0,0.09)',
                    }}
                  >
                    <Card className="w-full h-full rounded-2xl overflow-hidden bg-white relative" type="plain">
                      <Swiper
                        className="w-full h-[350px] !mb-0"
                        onSlideChange={swiper => handleSlideChange(swiper, idx)}
                        spaceBetween={0}
                        slidesPerView={1}
                        allowTouchMove={profile.images.length > 1}
                        style={{ marginBottom: 0 }}
                        initialSlide={imageIndexes[idx]}
                      >
                        {profile.images.map((src, idxImg) => (
                          <SwiperSlide key={src}>
                            <img src={src} alt={profile.name} className="h-[350px] w-full object-cover" />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <CardChip className="absolute top-2 left-2 z-10" readOnly>
                        {profile.city}
                      </CardChip>
                      <CardCell readOnly subtitle={`${profile.age} y.o`}>
                        {profile.name}
                      </CardCell>

                      {/* Buttons only on top card */}
                      {isTop && (
                        <div className="flex justify-around items-center py-3 mt-1 z-10">
                          <Button size="l" type="secondary" onClick={() => triggerSwipe('left')}>
                            <X />
                          </Button>
                          <Button size="l" type="secondary" onClick={() => alert('⭐ Super Like! (add your action)')}>
                            <Star />
                          </Button>
                          <Button size="l" type="secondary" onClick={() => triggerSwipe('right')}>
                            <Heart />
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
