<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../../common/Button.svelte';
  import TextField from '../../common/TextField.svelte';
  
  export let value = '';
  export let duration = 0;

  const dispatch = createEventDispatcher();
  let error = '';
  let uploading = false;
  let audioRef: HTMLAudioElement;

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      error = 'Please select an audio file';
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      error = 'File size must be less than 500MB';
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
      
      // Get audio duration
      if (audioRef) {
        audioRef.src = url;
        await new Promise((resolve) => {
          audioRef.onloadedmetadata = resolve;
        });
        duration = Math.round(audioRef.duration);
      }

      dispatch('change', { url, duration });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
    }
  }

  function handleUrlInput(event: Event) {
    const url = (event.target as HTMLInputElement).value;
    value = url;
    
    if (url && audioRef) {
      audioRef.src = url;
      audioRef.onloadedmetadata = () => {
        duration = Math.round(audioRef.duration);
        dispatch('change', { url, duration });
      };
    }
  }

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="audio-upload">
  <h3>Audio File</h3>

  <div class="upload-section">
    <div class="upload-area">
      {#if value}
        <div class="preview">
          <audio bind:this={audioRef} src={value} controls>
            Your browser does not support the audio element.
          </audio>
          {#if duration}
            <div class="duration">
              Duration: {formatDuration(duration)}
            </div>
          {/if}
        </div>
      {:else}
        <div class="upload-prompt">
          <input
            type="file"
            accept="audio/*"
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
              <div class="upload-text">
                <span class="upload-icon">🎵</span>
                <span>Click to upload or drag and drop</span>
                <span class="upload-hint">MP3, WAV, or M4A up to 500MB</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="url-input">
      <TextField
        id="audio-url"
        label="Or enter audio URL"
        value={value}
        on:input={handleUrlInput}
        placeholder="https://"
      />
    </div>
  </div>

  {#if error}
    <div class="error" role="alert">{error}</div>
  {/if}

  <!-- Hidden audio element for metadata extraction -->
  <audio 
    bind:this={audioRef} 
    style="display: none"
    preload="metadata"
  ></audio>
</div>

<style>
  .audio-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  h3 {
    font-size: var(--font-size-base);
    font-weight: 600;
    margin: 0;
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .upload-area {
    position: relative;
    min-height: 200px;
    background: var(--bg-primary);
    border: 2px dashed var(--border-primary);
    border-radius: var(--radius-md);
    transition: border-color var(--transition);
  }

  .upload-area:hover {
    border-color: var(--primary);
  }

  .preview {
    padding: var(--space-4);
  }

  .preview audio {
    width: 100%;
  }

  .duration {
    margin-top: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-align: right;
  }

  .upload-prompt {
    position: relative;
    height: 200px;
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

  .upload-text {
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