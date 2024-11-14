<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EmbedBlockData } from '../../../types/editor';
  import TextField from '../../common/TextField.svelte';
  
  export let value: EmbedBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();
  let error = '';

  const providers = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'wistia', label: 'Wistia' },
    { value: 'apple-podcast', label: 'Apple Podcasts' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'oembed', label: 'Generic oEmbed' }
  ];

  const aspectRatios = [
    { value: '16:9', label: '16:9 Widescreen' },
    { value: '4:3', label: '4:3 Standard' },
    { value: '1:1', label: '1:1 Square' }
  ];

  async function handleUrlChange(url: string) {
    try {
      error = '';
      
      if (!url) {
        handleChange({ ...value, url });
        return;
      }

      // Auto-detect provider from URL
      const provider = detectProvider(url);
      if (provider) {
        handleChange({ ...value, url, type: provider });
      } else {
        error = 'Unsupported URL format';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid URL';
    }
  }

  function detectProvider(url: string): EmbedBlockData['type'] | null {
    try {
      const parsed = new URL(url);
      
      if (parsed.hostname.includes('youtube.com') || parsed.hostname === 'youtu.be') {
        return 'youtube';
      }
      
      if (parsed.hostname.includes('wistia.com')) {
        return 'wistia';
      }
      
      if (parsed.hostname.includes('podcasts.apple.com')) {
        return 'apple-podcast';
      }
      
      if (parsed.hostname.includes('spotify.com')) {
        return 'spotify';
      }
      
      return 'oembed';
    } catch {
      return null;
    }
  }

  function handleChange(newValue: EmbedBlockData) {
    dispatch('change', newValue);
  }

  $: embedUrl = getEmbedUrl(value);

  function getEmbedUrl(data: EmbedBlockData): string {
    if (!data.url) return '';

    try {
      const url = new URL(data.url);
      
      switch (data.type) {
        case 'youtube': {
          const videoId = url.searchParams.get('v') || url.pathname.slice(1);
          return `https://www.youtube.com/embed/${videoId}`;
        }
        
        case 'wistia': {
          const videoId = url.pathname.split('/').pop();
          return `https://fast.wistia.net/embed/iframe/${videoId}`;
        }
        
        case 'spotify': {
          return url.href.replace('/track/', '/embed/track/')
                        .replace('/playlist/', '/embed/playlist/')
                        .replace('/album/', '/embed/album/');
        }
        
        default:
          return data.url;
      }
    } catch {
      return '';
    }
  }
</script>

<div class="embed-block">
  {#if !readOnly}
    <div class="controls">
      <TextField
        id="embed-url"
        label="URL"
        value={value.url}
        on:input={(e) => handleUrlChange(e.target.value)}
        placeholder="Paste URL here"
        error={error}
      />

      <div class="control-row">
        <select
          value={value.type}
          on:change={(e) => handleChange({ ...value, type: e.target.value as EmbedBlockData['type'] })}
        >
          {#each providers as provider}
            <option value={provider.value}>{provider.label}</option>
          {/each}
        </select>

        <select
          value={value.aspectRatio}
          on:change={(e) => handleChange({ ...value, aspectRatio: e.target.value as '16:9' | '4:3' | '1:1' })}
        >
          {#each aspectRatios as ratio}
            <option value={ratio.value}>{ratio.label}</option>
          {/each}
        </select>

        {#if value.type === 'youtube'}
          <label class="checkbox">
            <input
              type="checkbox"
              checked={value.autoplay}
              on:change={(e) => handleChange({ ...value, autoplay: e.target.checked })}
            />
            Autoplay
          </label>
        {/if}
      </div>

      <TextField
        id="embed-title"
        label="Title"
        value={value.title || ''}
        on:input={(e) => handleChange({ ...value, title: e.target.value })}
        placeholder="Optional title for accessibility"
      />
    </div>
  {/if}

  {#if embedUrl}
    <div 
      class="embed-container"
      style="--aspect-ratio: {value.aspectRatio || '16:9'}"
    >
      <iframe
        src={embedUrl}
        title={value.title || 'Embedded content'}
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  {/if}
</div>

<style>
  .embed-block {
    width: 100%;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .control-row {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .embed-container {
    position: relative;
    width: 100%;
    padding-top: calc(100% / (16/9));
  }

  .embed-container[style*="--aspect-ratio: 4:3"] {
    padding-top: calc(100% / (4/3));
  }

  .embed-container[style*="--aspect-ratio: 1:1"] {
    padding-top: 100%;
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: var(--radius-md);
  }
</style>