<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GalleryBlockData } from '../../../types/editor';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';
  
  export let value: GalleryBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();
  let uploading = false;
  let error = '';

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    
    if (files.length === 0) return;
    
    if (!files.every(file => file.type.startsWith('image/'))) {
      error = 'Please select only image files';
      return;
    }

    try {
      uploading = true;
      error = '';
      
      const uploads = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Upload failed');

        const { url } = await response.json();
        return { url, alt: '', caption: '' };
      }));

      handleChange({
        ...value,
        images: [...value.images, ...uploads]
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
    }
  }

  function handleChange(newValue: GalleryBlockData) {
    dispatch('change', newValue);
  }

  function removeImage(index: number) {
    const newImages = [...value.images];
    newImages.splice(index, 1);
    handleChange({ ...value, images: newImages });
  }

  function updateImage(index: number, updates: Partial<typeof value.images[0]>) {
    const newImages = [...value.images];
    newImages[index] = { ...newImages[index], ...updates };
    handleChange({ ...value, images: newImages });
  }
</script>

<div class="gallery-block">
  {#if !readOnly}
    <div class="controls">
      <select
        value={value.layout}
        on:change={(e) => handleChange({ ...value, layout: e.target.value as 'grid' | 'masonry' })}
      >
        <option value="grid">Grid Layout</option>
        <option value="masonry">Masonry Layout</option>
      </select>

      <select
        value={value.columns}
        on:change={(e) => handleChange({ ...value, columns: parseInt(e.target.value) })}
      >
        <option value="2">2 Columns</option>
        <option value="3">3 Columns</option>
        <option value="4">4 Columns</option>
      </select>
    </div>
  {/if}

  <div 
    class="gallery"
    class:gallery--grid={value.layout === 'grid'}
    class:gallery--masonry={value.layout === 'masonry'}
    style="--columns: {value.columns || 3}"
  >
    {#each value.images as image, index}
      <div class="gallery-item">
        <img src={image.url} alt={image.alt} />
        
        {#if !readOnly}
          <div class="gallery-item__overlay">
            <TextField
              id={`alt-${index}`}
              label="Alt Text"
              value={image.alt}
              on:input={(e) => updateImage(index, { alt: e.target.value })}
            />
            
            <TextField
              id={`caption-${index}`}
              label="Caption"
              value={image.caption || ''}
              on:input={(e) => updateImage(index, { caption: e.target.value })}
            />
            
            <Button
              variant="error"
              size="sm"
              on:click={() => removeImage(index)}
            >
              Remove
            </Button>
          </div>
        {:else if image.caption}
          <div class="gallery-item__caption">
            {image.caption}
          </div>
        {/if}
      </div>
    {/each}

    {#if !readOnly}
      <div class="upload-area">
        <input
          type="file"
          accept="image/*"
          multiple
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
              <span>Add Images</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .gallery-block {
    width: 100%;
  }

  .controls {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  .gallery {
    display: grid;
    gap: var(--space-4);
  }

  .gallery--grid {
    grid-template-columns: repeat(var(--columns), 1fr);
  }

  .gallery--masonry {
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-auto-flow: dense;
  }

  .gallery-item {
    position: relative;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .gallery-item img {
    width: 100%;
    height: auto;
    display: block;
  }

  .gallery-item__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    padding: var(--space-4);
    opacity: 0;
    transition: opacity var(--transition);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .gallery-item:hover .gallery-item__overlay {
    opacity: 1;
  }

  .gallery-item__caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--space-2) var(--space-4);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: var(--font-size-sm);
  }

  .upload-area {
    position: relative;
    height: 200px;
    border: 2px dashed var(--border-primary);
    border-radius: var(--radius-md);
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

  .error {
    color: var(--error);
    margin-top: var(--space-4);
    font-size: var(--font-size-sm);
  }
</style>