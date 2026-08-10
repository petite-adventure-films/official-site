import { useMemo, useState } from 'react';

import ImageCarousel, { type ImageCarouselImage } from './ImageCarousel';

export interface GoodbyeGalleryEntry {
  year: number;
  month: number;
  day: number;
  images: ImageCarouselImage[];
}

interface GoodbyeGalleryProps {
  entries: GoodbyeGalleryEntry[];
}

const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = Array.from({ length: 31 }, (_, index) => index + 1);

const entryKey = (entry: Pick<GoodbyeGalleryEntry, 'year' | 'month' | 'day'>) =>
  `${String(entry.year)}-${String(entry.month)}-${String(entry.day)}`;

export default function GoodbyeGallery({ entries }: GoodbyeGalleryProps) {
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day),
    [entries],
  );

  const entriesByYear = useMemo(() => {
    const grouped = new Map<number, GoodbyeGalleryEntry[]>();
    sortedEntries.forEach((entry) => {
      grouped.set(entry.year, [...(grouped.get(entry.year) ?? []), entry]);
    });
    return grouped;
  }, [sortedEntries]);

  const firstEntry = sortedEntries.at(0);
  const [selectedKey, setSelectedKey] = useState(() => (firstEntry ? entryKey(firstEntry) : ''));

  const selectedEntry =
    sortedEntries.find((entry) => entryKey(entry) === selectedKey) ?? firstEntry;
  const selectedYear = selectedEntry?.year;
  const selectedMonth = selectedEntry?.month;
  const selectedDay = selectedEntry?.day;
  const selectedYearEntries =
    selectedYear === undefined ? [] : (entriesByYear.get(selectedYear) ?? []);
  const selectedMonthEntries = selectedYearEntries.filter((entry) => entry.month === selectedMonth);
  const years = Array.from(entriesByYear.keys());

  const selectFirstEntry = (year: number, month?: number) => {
    const yearEntries = entriesByYear.get(year) ?? [];
    const nextEntry =
      month === undefined ? yearEntries[0] : yearEntries.find((entry) => entry.month === month);

    if (nextEntry) {
      setSelectedKey(entryKey(nextEntry));
    }
  };

  if (!selectedEntry) {
    return null;
  }

  return (
    <div className="mt-4">
      <div role="tablist" aria-label="解体写真の年" className="flex border-x border-t border-white">
        {years.map((year) => {
          const selected = year === selectedYear;
          return (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={selected}
              className={[
                'w-1/3 border-white py-2 text-sm focus:outline-none sm:hover:text-black',
                year !== years[0] ? 'border-l' : '',
                selected ? 'bg-white/25' : 'bg-tkhd73-green-shadow/25 text-gray-500',
              ].join(' ')}
              onClick={() => {
                selectFirstEntry(year);
              }}
            >
              {year}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-wrap border border-white">
        {months.map((month) => {
          const hasMonth = selectedYearEntries.some((entry) => entry.month === month);
          const selected = month === selectedMonth;
          return (
            <li
              key={month}
              className={[
                'h-12 w-1/6 border-white',
                month > 6 ? 'border-t' : '',
                month % 6 !== 1 ? 'border-l' : '',
              ].join(' ')}
            >
              <button
                type="button"
                disabled={!hasMonth}
                aria-pressed={hasMonth ? selected : undefined}
                className={[
                  'flex h-full w-full flex-col items-center justify-center text-sm leading-none',
                  selected ? 'bg-white/25' : '',
                  hasMonth ? 'sm:hover:bg-white/25' : 'bg-tkhd73-green-shadow/25 text-gray-500',
                ].join(' ')}
                onClick={() => {
                  if (selectedYear) {
                    selectFirstEntry(selectedYear, month);
                  }
                }}
              >
                {month}
                <span className="block h-4">{hasMonth ? '📷' : ''}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-4 grid grid-cols-[repeat(31,1fr)]">
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-white" />
        {days.map((day) => {
          const dayEntry = selectedMonthEntries.find((entry) => entry.day === day);
          const selected = day === selectedDay;
          return (
            <div key={day} className="relative">
              {dayEntry && (
                <button
                  type="button"
                  aria-pressed={selected}
                  className={[
                    'block h-8 w-8 rounded-full border-2 border-white text-xs sm:hover:bg-white',
                    selected ? 'bg-white' : 'bg-tkhd73-green-shadow',
                  ].join(' ')}
                  onClick={() => {
                    setSelectedKey(entryKey(dayEntry));
                  }}
                >
                  {day}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ImageCarousel
        key={selectedKey}
        images={selectedEntry.images}
        ariaLabel={`${String(selectedEntry.year)}年${String(selectedEntry.month)}月${String(selectedEntry.day)}日の73号棟解体写真`}
        autoplay
        showBullets
        loop
        className="mt-4 [&_.relative.border]:border-white"
      />
    </div>
  );
}
