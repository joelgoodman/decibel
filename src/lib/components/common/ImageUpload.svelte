<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let label: string;
  export let value = '';
  export let aspectRatio = '1:1';
  export let maxSize = 5; // in MB

  const dispatch = createEventDispatcher();
  let error = '';
  let uploading = false;

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      error = 'Please select an image file';
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      error = `File size must be less than ${maxSize}MB`;
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
      value = url;
      dispatch('change', url);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
    }
  }

  function handleRemove() {
    value = '';
    dispatch('change', '');
  }
</script>

<div class="image-upload">
  <label>{label}</label>

  <div 
    class="upload-area"
    style="--aspect-ratio: {aspectRatio}"
  >
    {#if value}
      <div class="preview">
        <img src={value} alt="" />
        <button class="remove-button" on:click={handleRemove}>
          Remove Image
        </button>
      </div>
    {:else}
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
            <span>Click to upload or drag and drop</span>
            <span class="upload-hint">Maximum file size: {maxSize}MB</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .upload-area {
    position: relative;
    width: 100%;
    background: var(--bg-secondary);
    border: 2px dashed var(--border-primary);
    border-radius: var(--radius-md);
    transition: border-color var(--transition);
  }

  .upload-area::before {
    content: '';
    display: block;
    padding-top: calc(100% / (16/9));
  }

  .upload-area:hover {
    border-color: var(--primary);
  }

  .preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: calc(var(--radius-md) - 2px);
  }

  .remove-button {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--transition);
  }

  .preview:hover .remove-button {
    opacity: 1;
  }

  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
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

  .upload-hint {
    display: block;
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
    opacity: 0.7;
  }

  .error {
    color: var(--error);
    font-size: var(--font-size-sm);
  }
</style>