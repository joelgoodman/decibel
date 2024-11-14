<script lang="ts">
  import { auth } from '../lib/stores/auth';
</script>

<div class="container">
  <h1>Welcome to Decibel</h1>
  
  {#if $auth.isAuthenticated}
    <p>Welcome back, {$auth.user?.name || $auth.user?.email}</p>
  {:else}
    <p>A modern platform for newsletters, blogs, and podcasts.</p>
    <div class="cta">
      <a href="/login" class="button">Get Started</a>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .cta {
    margin-top: 2rem;
  }

  .button {
    display: inline-block;
    padding: 0.8rem 1.6rem;
    background-color: #4a90e2;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .button:hover {
    background-color: #357abd;
  }
</style>