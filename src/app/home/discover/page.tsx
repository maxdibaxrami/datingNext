'use client';

import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { Card, Button } from '@telegram-apps/telegram-ui';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';
import { fetchProfiles, DiscoverResult } from '@/lib/api/discover';
import { getIconForField } from '@/components/profileIcons';

const genders = ['male','female','non_binary','other'];
const lookingForOpts = ['chat','casual','long_term','friends','virtual'];

function ageFromDOB(dob?: string | null) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}


export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{[k:string]:string}>({});
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProfiles(filters);
      setProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return (
    <Page back={false}>
      <div className="flex justify-end p-2">
        <Button size="s" type="secondary" onClick={() => setShowFilters(true)}>
          Filters
        </Button>
      </div>
      <div className="p-2 flex flex-col gap-4">
        {profiles.map(p => (
          <Card key={p.id} className="overflow-hidden rounded-xl" type="plain">
            {p.image_url && (
              <img src={p.image_url} className="w-full h-48 object-cover" alt={p.name} />
            )}
            <CardCell
              readOnly
              subtitle={[p.city, p.country].filter(Boolean).join(', ')}
            >
              {p.name}{p.birth_date ? `, ${ageFromDOB(p.birth_date)}` : ''}
            </CardCell>
            <div className="flex flex-wrap gap-1 p-2">
              {p.looking_for && (
                <CardChip readOnly>
                  {getIconForField('field.lookingFor')} {p.looking_for}
                </CardChip>
              )}
              {p.smoking && (
                <CardChip readOnly>
                  {getIconForField('field.smoking')} {p.smoking}
                </CardChip>
              )}
              {p.drinking && (
                <CardChip readOnly>
                  {getIconForField('field.drinking')} {p.drinking}
                </CardChip>
              )}
              {p.education && (
                <CardChip readOnly>
                  {getIconForField('field.education')} {p.education}
                </CardChip>
              )}
            
            </div>
          </Card>
        ))}
        {loading && <p className="text-center">Loading...</p>}
      </div>
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-[90%] max-w-md">
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">City</label>
                <input
                  className="border w-full p-1"
                  value={filters.city || ''}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Country</label>
                <input
                  className="border w-full p-1"
                  value={filters.country || ''}
                  onChange={e => setFilters({ ...filters, country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Gender</label>
                <select
                  className="border w-full p-1"
                  value={filters.gender || ''}
                  onChange={e => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">Any</option>
                  {genders.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Looking for</label>
                <select
                  className="border w-full p-1"
                  value={filters.looking_for || ''}
                  onChange={e => setFilters({ ...filters, looking_for: e.target.value })}
                >
                  <option value="">Any</option>
                  {lookingForOpts.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button size="s" type="secondary" onClick={() => setShowFilters(false)}>
                Cancel
              </Button>
              <Button size="s" onClick={() => { setShowFilters(false); load(); }}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}