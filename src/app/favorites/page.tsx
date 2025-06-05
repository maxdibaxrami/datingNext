'use client';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { List, Cell, Section } from '@telegram-apps/telegram-ui';
import { Favorite, getFavorites } from '@/lib/api/favorites';
import EmptyData from '@/components/EmptyData';
import { useTranslations } from 'next-intl';

export default function FavoritesPage() {
  const t = useTranslations('i18n');
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (e) {
        console.error('load favorites', e);
      }
    })();
  }, []);

  return (
    <Page back={true}>
      <div className="p-4">
        <List>
          <Section header={t('Favorites')}>
            {favorites.length === 0 && <EmptyData text={t('noFavorites')} />}
            {favorites.map((f) => (
              <Cell
                key={f.id}
                before={f.image_url ? (
                  <img src={f.image_url} className="w-8 h-8 rounded" alt={f.name} />
                ) : undefined}
                subtitle={[f.city, f.country].filter(Boolean).join(', ')}
              >
                {f.name}
              </Cell>
            ))}
          </Section>
        </List>
      </div>
    </Page>
  );
}