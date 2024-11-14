<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isValidUrl } from '../../../utils/editor';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';
  
  export let value: {
    url: string;
    alt: string;
    caption?: string;
  };
  export let readOnly = false;

  const dispatch = createEventDispatcher();
  let uploading = false;
  let error = '';

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      error = 'Please select an image file';
      return;
    }

    try {
      uploading = true;
      error = '';
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      handleChange({ ...value, url });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
    }
  }

  function handleChange(newValue: typeof value) {
    if (newValue.url && !isValidUrl(newValue.url)) {
      error = 'Please enter a valid URL';
      return;
    }
    error = '';
    dispatch('change', newValue);
  }
</script>

<div class="image-block">
  {#if value.url}
    <div class="image-preview">
      <img
        src={value.url}
        alt={value.alt}
        class="image"
      />
      
      {#if !readOnly}
        <div class="image-controls">
          <Button
            variant="secondary"
            size="sm"
            on:click={() => handleChange({ ...value, url: '' })}
          >
            Remove Image
          </Button>
        </div>
      {/if}
    </div>
  {:else if !readOnly}
    <div class="upload-area">
      <input
        type="file"
        accept="image/*"
        on:change={handleFileSelect}
        class="file-input"
        disabled={uploading}
      />
      <div class="upload-content">
        {#if uploading}
          <div class="uploading">
            Uploading...
          </div>
        {:else}
          <div class="upload-prompt">
            <span class="upload-icon">📷</span>
            <span>Click to upload an image or drag and drop</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if !readOnly}
    <div class="fields">
      <TextField
        id="alt"
        label="Alt Text"
        value={value.alt}
        on:input={(e) => handleChange({ ...value, alt: e.target.value })}
        placeholder="Describe the image for accessibility"
        required
      />
      
      <TextField
        id="caption"
        label="Caption"
        value={value.caption || ''}
        on:input={(e) => handleChange({ ...value, caption: e.target.value })}
        placeholder="Add a caption (optional)"
      />
    </div>
  {:else if value.caption}
    <div class="caption">{value.caption}</div>
  {/if}
</div>

<style>
  .image-block {
    width: 100%;
  }

  .image-preview {
    position: relative;
    margin-bottom: var(--space-4);
  }

  .image {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
  }

  .image-controls {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    opacity: 0;
    transition: opacity var(--transition);
  }

  .image-preview:hover .image-controls {
    opacity: 1;
  }

  .upload-area {
    position: relative;
    width: 100%;
    height: 200px;
    border: 2px dashed var(--border-primary);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    transition: border-color var(--transition);
  }

  .upload-area:hover {
    border-color: var(--primary);
  }

  .file-input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  .file-input:disabled {
    cursor: not-allowed;
  }

  .upload-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .upload-prompt {
    text-align: center;
    color: var(--text-secondary);
  }

  .upload-icon {
    display: block;
    font-size: 2rem;
    margin-bottom: var(--space-2);
  }

  .uploading {
    color: var(--text-secondary);
  }

  .error {
    color: var(--error);
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .caption {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
    text-align: center;
  }
</style>