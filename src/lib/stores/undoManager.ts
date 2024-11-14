import { writable } from 'svelte/store';
import type { Block } from '../types/editor';

function createUndoManager() {
  const MAX_HISTORY = 50;
  let history: Block[][] = [];
  let currentIndex = -1;

  const { subscribe, set } = writable<Block[]>([]);

  return {
    subscribe,
    add: (blocks: Block[]) => {
      // Remove any future history if we're not at the end
      if (currentIndex < history.length - 1) {
        history = history.slice(0, currentIndex + 1);
      }

      // Add new state
      history.push([...blocks]);
      if (history.length > MAX_HISTORY) {
        history.shift();
      }
      currentIndex = history.length - 1;

      set(blocks);
    },
    undo: () => {
      if (currentIndex > 0) {
        currentIndex--;
        const blocks = history[currentIndex];
        set(blocks);
        return blocks;
      }
      return null;
    },
    redo: () => {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        const blocks = history[currentIndex];
        set(blocks);
        return blocks;
      }
      return null;
    },
    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < history.length - 1,
    clear: () => {
      history = [];
      currentIndex = -1;
      set([]);
    }
  };
}

export const undoManager = createUndoManager();