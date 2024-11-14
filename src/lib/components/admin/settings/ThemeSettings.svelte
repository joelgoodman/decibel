<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ColorPicker from '../../common/ColorPicker.svelte';
  import Button from '../../common/Button.svelte';

  export let settings = {
    mode: 'light',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb'
    },
    typography: {
      scale: 1.2,
      baseline: 16
    },
    spacing: {
      container: '1200px',
      grid: 8
    },
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem'
    }
  };
  export let saving = false;

  const dispatch = createEventDispatcher();

  const modes = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' }
  ];

  const scales = [
    { value: 1.067, label: 'Minor Second (1.067)' },
    { value: 1.125, label: 'Major Second (1.125)' },
    { value: 1.2, label: 'Minor Third (1.2)' },
    { value: 1.25, label: 'Major Third (1.25)' },
    { value: 1.333, label: 'Perfect Fourth (1.333)' }
  ];

  async function handleSave() {
    dispatch('save', settings);
  }

  function handleReset() {
    settings = {
      mode: 'light',
      colors: {
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb'
      },
      typography: {
        scale: 1.2,
        baseline: 16
      },
      spacing: {
        container: '1200px',
        grid: 8
      },
      radius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem'
      }
    };
  }
</script>

<div class="theme-settings">
  <header class="section-header">
    <div>
      <h2>Theme & Design</h2>
      <p class="description">Customize your site's visual appearance</p>
    </div>
    <div class="actions">
      <Button
        variant="secondary"
        on:click={handleReset}
        disabled={saving}
      >
        Reset to Defaults
      </Button>
      <Button
        variant="primary"
        on:click={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  </header>

  <div class="settings-grid">
    <div class="form-section">
      <h3>Color Mode</h3>
      
      <div class="form-group">
        <label for="mode">Default Color Mode</label>
        <select id="mode" bind:value={settings.mode}>
          {#each modes as mode}
            <option value={mode.value}>{mode.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="form-section">
      <h3>Color System</h3>
      
      <div class="color-grid">
        <ColorPicker
          label="Background Color"
          bind:value={settings.colors.background}
        />

        <ColorPicker
          label="Text Color"
          bind:value={settings.colors.text}
        />

        <ColorPicker
          label="Border Color"
          bind:value={settings.colors.border}
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Typography</h3>
      
      <div class="form-group">
        <label for="scale">Type Scale</label>
        <select id="scale" bind:value={settings.typography.scale}>
          {#each scales as scale}
            <option value={scale.value}>{scale.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="baseline">Base Font Size (px)</label>
        <input
          id="baseline"
          type="number"
          bind:value={settings.typography.baseline}
          min="12"
          max="20"
          step="1"
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Layout & Spacing</h3>
      
      <div class="form-group">
        <label for="container">Max Container Width</label>
        <input
          id="container"
          type="text"
          bind:value={settings.spacing.container}
          placeholder="1200px"
        />
      </div>

      <div class="form-group">
        <label for="grid">Grid Base Unit (px)</label>
        <input
          id="grid"
          type="number"
          bind:value={settings.spacing.grid}
          min="4"
          max="16"
          step="2"
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Border Radius</h3>
      
      <div class="radius-grid">
        <div class="form-group">
          <label for="radius-sm">Small</label>
          <input
            id="radius-sm"
            type="text"
            bind:value={settings.radius.sm}
            placeholder="0.25rem"
          />
        </div>

        <div class="form-group">
          <label for="radius-md">Medium</label>
          <input
            id="radius-md"
            type="text"
            bind:value={settings.radius.md}
            placeholder="0.375rem"
          />
        </div>

        <div class="form-group">
          <label for="radius-lg">Large</label>
          <input
            id="radius-lg"
            type="text"
            bind:value={settings.radius.lg}
            placeholder="0.5rem"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .theme-settings {
    max-width: 800px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
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

  .settings-grid {
    display: grid;
    gap: var(--space-8);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin: 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  select,
  input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  input[type="number"] {
    width: 120px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .radius-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  @media (max-width: 640px) {
    .color-grid,
    .radius-grid {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
      gap: var(--space-2);
    }
  }
</style>