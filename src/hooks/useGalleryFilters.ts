'use client';

import { useMemo, useState } from 'react';
import { GalleryItem } from '@/types/gallery';
import { galleryFilters } from '@/lib/gallery-data';
import type { FilterOption } from '@/components/ui/MultiSelectFilter';
import { useDebounce } from '@/hooks/useDebounce';

export type FilterLogic = 'AND' | 'OR';

interface UseGalleryFiltersResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  filterLogic: FilterLogic;
  setFilterLogic: (logic: FilterLogic) => void;
  categoryOptions: FilterOption[];
  filteredItems: GalleryItem[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function useGalleryFilters(items: GalleryItem[]): UseGalleryFiltersResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterLogic, setFilterLogic] = useState<FilterLogic>('OR');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const categoryOptions = useMemo((): FilterOption[] => {
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return galleryFilters
      .filter(filter => filter.category !== 'all')
      .map(filter => ({
        value: filter.category,
        label: filter.label,
        count: categoryCounts[filter.category] || 0,
      }));
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Category filtering with AND/OR logic
    if (selectedCategories.length > 0) {
      if (filterLogic === 'AND') {
        result = result.filter(item =>
          selectedCategories.every(category => item.category === category)
        );
      } else {
        result = result.filter(item => selectedCategories.includes(item.category));
      }
    }

    // Search filtering
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const searchableFields: string[] = [
          item.title,
          item.description ?? '',
          item.medium ?? '',
          item.category,
          item.year != null ? String(item.year) : '',
        ];

        return searchableFields.some(field => field.toLowerCase().includes(query));
      });
    }

    return result;
  }, [items, selectedCategories, filterLogic, debouncedSearchQuery]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategories.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    filterLogic,
    setFilterLogic,
    categoryOptions,
    filteredItems,
    hasActiveFilters,
    clearFilters,
  };
}


