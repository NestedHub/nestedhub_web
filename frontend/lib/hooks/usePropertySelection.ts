// hooks/usePropertySelection.ts
"use client";

import { useState, useCallback } from 'react';

/**
 * Manages the selection of property IDs for comparison.
 * @returns {object} An object containing the selected property IDs,
 * functions to add/remove IDs, toggle selection,
 * and clear all selections.
 */
export function usePropertySelection() {
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  const addProperty = useCallback((propertyId: number) => {
    setSelectedPropertyIds(prevIds => {
      if (!prevIds.includes(propertyId)) {
        return [...prevIds, propertyId];
      }
      return prevIds;
    });
  }, []);

  const removeProperty = useCallback((propertyId: number) => {
    setSelectedPropertyIds(prevIds => prevIds.filter(id => id !== propertyId));
  }, []);

  const toggleProperty = useCallback((propertyId: number) => {
    setSelectedPropertyIds(prevIds => {
      if (prevIds.includes(propertyId)) {
        return prevIds.filter(id => id !== propertyId);
      } else {
        return [...prevIds, propertyId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPropertyIds([]);
  }, []);

  return {
    selectedPropertyIds,
    addProperty,
    removeProperty,
    toggleProperty,
    clearSelection,
    isPropertySelected: useCallback((propertyId: number) => selectedPropertyIds.includes(propertyId), [selectedPropertyIds]),
  };
}