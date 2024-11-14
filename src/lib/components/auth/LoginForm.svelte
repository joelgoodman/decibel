<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '@lib/stores/auth';
  import { fade } from 'svelte/transition';
  import TextField from '../common/TextField.svelte';

  const dispatch = createEventDispatcher();
  let email = '';
  let errorMessage = '';
  let successMessage = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    try {
      errorMessage = '';
      successMessage = '';
      const success = await auth.login(email);
      
      if (success) {
        successMessage = 'Check your email for the magic link!';
        setTimeout(() => {
          successMessage = 'You can close this tab after clicking the link in your email.';
        }, 2000);
        dispatch('success');
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'An error occurred';
    }
  }

  $: isLoading = $auth.isLoading;
</script>

<div class="login-form">
  {#if errorMessage}
    <div class="alert error" role="alert" transition:fade>
      <svg xmlns="http://www.w3.org/2000/svg" class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div class="alert success" role="alert" transition:fade>
      <svg xmlns="http://www.w3.org/2000/svg" class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      {successMessage}
    </div>
  {/if}

  <form on:submit={handleSubmit}>
    <TextField
      id="email"
      label="Email address"
      type="email"
      bind:value={email}
      placeholder="you@example.com"
      disabled={isLoading}
      required
    />

    <button 
      type="submit" 
      class="submit-button" 
      disabled={isLoading || !email}
    >
      {#if isLoading}
        <span class="loading"></span>
      {:else}
        Send Magic Link
      {/if}
    </button>
  </form>
</div>

<style>
  .login-form {
    width: 100%;
  }

  .submit-button {
    width: 100%;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
  }

  .submit-button:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
  }

  .alert-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .error {
    background-color: var(--error-bg);
    color: var(--error-text);
  }

  .success {
    background-color: var(--success-bg);
    color: var(--success-text);
  }

  .loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>