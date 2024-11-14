<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TextField from '../../common/TextField.svelte';
  import Button from '../../common/Button.svelte';
  import ImageUpload from '../../common/ImageUpload.svelte';

  export let settings = {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    robotsTxt: '',
    customMeta: []
  };
  export let saving = false;

  const dispatch = createEventDispatcher();
  let error = '';

  function addCustomMeta() {
    settings.customMeta = [
      ...settings.customMeta,
      { name: '', content: '' }
    ];
  }

  function removeCustomMeta(index: number) {
    settings.customMeta = settings.customMeta.filter((_, i) => i !== index);
  }

  async function handleSave() {
    if (!settings.title || !settings.description) {
      error = 'Title and description are required';
      return;
    }

    dispatch('save', settings);
  }
</script>

<div class="seo-settings">
  <header class="section-header">
    <div>
      <h2>SEO & Metadata</h2>
      <p class="description">Optimize your site for search engines and social sharing</p>
    </div>
    <Button
      variant="primary"
      on:click={handleSave}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </header>

  {#if error}
    <div class="error" role="alert">
      {error}
    </div>
  {/if}

  <div class="settings-grid">
    <div class="form-section">
      <h3>Basic SEO</h3>
      
      <div class="form-group">
        <TextField
          id="meta-title"
          label="Default Meta Title"
          bind:value={settings.title}
          required
          maxlength={60}
        />
        <span class="hint">Recommended length: 50-60 characters</span>
      </div>

      <div class="form-group">
        <TextField
          id="meta-description"
          label="Default Meta Description"
          bind:value={settings.description}
          required
          multiline
          maxlength={160}
        />
        <span class="hint">Recommended length: 150-160 characters</span>
      </div>

      <div class="form-group">
        <TextField
          id="keywords"
          label="Focus Keywords"
          bind:value={settings.keywords}
          placeholder="Comma-separated keywords..."
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Social Media</h3>
      
      <div class="form-group">
        <ImageUpload
          label="Default Social Image"
          bind:value={settings.ogImage}
          aspectRatio="1.91:1"
          maxSize={2}
        />
        <span class="hint">Recommended size: 1200x630 pixels</span>
      </div>

      <div class="form-group">
        <TextField
          id="twitter"
          label="Twitter Handle"
          bind:value={settings.twitterHandle}
          placeholder="@username"
        />
      </div>
    </div>

    <div class="form-section">
      <h3>Advanced Settings</h3>
      
      <div class="form-group">
        <TextField
          id="ga-id"
          label="Google Analytics ID"
          bind:value={settings.googleAnalyticsId}
          placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
        />
      </div>

      <div class="form-group">
        <TextField
          id="robots"
          label="Robots.txt Content"
          bind:value={settings.robotsTxt}
          multiline
          rows={5}
          placeholder="User-agent: *\nAllow: /"
        />
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3>Custom Meta Tags</h3>
        <Button
          variant="secondary"
          size="sm"
          on:click={addCustomMeta}
        >
          Add Meta Tag
        </Button>
      </div>
      
      {#each settings.customMeta as meta, index}
        <div class="meta-row">
          <TextField
            label="Name"
            bind:value={meta.name}
            placeholder="name or property"
          />
          <TextField
            label="Content"
            bind:value={meta.content}
          />
          <button
            class="remove-button"
            on:click={() => removeCustomMeta(index)}
            title="Remove meta tag"
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .seo-settings {
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

  .error {
    padding: var(--space-3);
    background: var(--error-light);
    color: var(--error);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
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

  .hint {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .meta-row {
    display: grid;
    grid-template-columns: 1fr 2fr auto;
    gap: var(--space-2);
    align-items: flex-end;
  }

  .remove-button {
    padding: var(--space-2);
    height: 38px;
    background: var(--error-light);
    color: var(--error);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-lg);
    line-height: 1;
  }

  .remove-button:hover {
    background: var(--error);
    color: white;
  }

  @media (max-width: 640px) {
    .meta-row {
      grid-template-columns: 1fr;
    }
  }
</style>