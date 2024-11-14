<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DndContext, closestCenter } from '@dnd-kit/core';
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
  import TextField from '../../common/TextField.svelte';
  import Button from '../../common/Button.svelte';

  export let settings = {
    menus: {
      primary: {
        items: [],
        location: 'header'
      },
      footer: {
        items: [],
        location: 'footer'
      }
    }
  };
  export let saving = false;

  const dispatch = createEventDispatcher();
  let activeMenu = 'primary';
  let showItemForm = false;
  let newItem = {
    label: '',
    url: '',
    type: 'custom'
  };

  const menuLocations = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'sidebar', label: 'Sidebar' }
  ];

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = settings.menus[activeMenu].items.findIndex(i => i.id === active.id);
      const newIndex = settings.menus[activeMenu].items.findIndex(i => i.id === over.id);
      
      const items = [...settings.menus[activeMenu].items];
      const [movedItem] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, movedItem);
      
      settings.menus[activeMenu].items = items;
      dispatch('change', settings);
    }
  }

  function addMenuItem() {
    if (!newItem.label || !newItem.url) return;

    settings.menus[activeMenu].items = [
      ...settings.menus[activeMenu].items,
      {
        id: crypto.randomUUID(),
        ...newItem
      }
    ];

    newItem = { label: '', url: '', type: 'custom' };
    showItemForm = false;
    dispatch('change', settings);
  }

  function removeMenuItem(id: string) {
    settings.menus[activeMenu].items = settings.menus[activeMenu].items.filter(
      item => item.id !== id
    );
    dispatch('change', settings);
  }

  function updateMenuLocation(location: string) {
    settings.menus[activeMenu].location = location;
    dispatch('change', settings);
  }
</script>

<div class="menu-settings">
  <header class="section-header">
    <div>
      <h2>Navigation Menus</h2>
      <p class="description">Configure site navigation menus and their locations</p>
    </div>
    <Button
      variant="primary"
      on:click={() => dispatch('save')}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </header>

  <div class="menu-layout">
    <div class="menu-sidebar">
      <div class="menu-tabs">
        <button
          class="menu-tab"
          class:active={activeMenu === 'primary'}
          on:click={() => activeMenu = 'primary'}
        >
          Primary Menu
        </button>
        <button
          class="menu-tab"
          class:active={activeMenu === 'footer'}
          on:click={() => activeMenu = 'footer'}
        >
          Footer Menu
        </button>
      </div>

      <div class="menu-location">
        <label>Menu Location</label>
        <select 
          value={settings.menus[activeMenu].location}
          on:change={e => updateMenuLocation(e.target.value)}
        >
          {#each menuLocations as location}
            <option value={location.value}>{location.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="menu-content">
      <div class="menu-items">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={settings.menus[activeMenu].items}
            strategy={verticalListSortingStrategy}
          >
            {#each settings.menus[activeMenu].items as item (item.id)}
              <div class="menu-item">
                <div class="item-content">
                  <div class="item-info">
                    <span class="item-label">{item.label}</span>
                    <span class="item-url">{item.url}</span>
                  </div>
                  <button
                    class="remove-button"
                    on:click={() => removeMenuItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            {/each}
          </SortableContext>
        </DndContext>

        {#if showItemForm}
          <div class="item-form">
            <TextField
              id="item-label"
              label="Label"
              bind:value={newItem.label}
              required
            />
            <TextField
              id="item-url"
              label="URL"
              bind:value={newItem.url}
              required
            />
            <div class="form-actions">
              <Button
                variant="secondary"
                size="sm"
                on:click={() => showItemForm = false}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                on:click={addMenuItem}
                disabled={!newItem.label || !newItem.url}
              >
                Add Item
              </Button>
            </div>
          </div>
        {:else}
          <Button
            variant="secondary"
            on:click={() => showItemForm = true}
          >
            Add Menu Item
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .menu-settings {
    max-width: 800px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }

  h2 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .menu-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-6);
  }

  .menu-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .menu-tabs {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .menu-tab {
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    text-align: left;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition);
  }

  .menu-tab:hover {
    background: var(--bg-secondary);
  }

  .menu-tab.active {
    background: var(--primary);
    color: white;
  }

  .menu-location {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .menu-location label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .menu-location select {
    padding: var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  .menu-content {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .menu-item {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3);
  }

  .item-info {
    display: flex;
    flex-direction: column;
  }

  .item-label {
    font-weight: 500;
  }

  .item-url {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .remove-button {
    padding: var(--space-1) var(--space-2);
    background: var(--error-light);
    color: var(--error);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .remove-button:hover {
    background: var(--error);
    color: white;
  }

  .item-form {
    background: var(--bg-primary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  @media (max-width: 768px) {
    .menu-layout {
      grid-template-columns: 1fr;
    }

    .menu-tabs {
      flex-direction: row;
    }
  }
</style>