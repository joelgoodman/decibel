<!-- App.svelte -->
<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { getContext } from 'svelte';
  import { onMount } from "svelte";
  import Home from "./routes/Home.svelte";
  import Login from "./routes/Login.svelte";
  import AuthCallback from "./routes/AuthCallback.svelte";
  import Dashboard from "./routes/Dashboard.svelte";
  import Publications from "./routes/Publications.svelte";
  import { auth } from "./lib/stores/auth";
  import { theme } from "./lib/stores/theme";
  import ThemeToggle from "./lib/components/common/ThemeToggle.svelte";
  import ProtectedRoute from "./lib/components/auth/ProtectedRoute.svelte";
  import SessionManager from "./lib/components/auth/SessionManager.svelte";
  import ErrorBoundary from "./lib/components/error/ErrorBoundary.svelte";

  export let url = "";
  const queryClient = getContext('queryClient');

  onMount(() => {
    theme.initialize();
  });
</script>

<QueryClientProvider client={queryClient}>
  <ErrorBoundary>
    <Router {url}>
      <main>
        <nav class="nav">
          <div class="nav__left">
            <Link to="/">Decibel</Link>
          </div>
          <div class="nav__right">
            <ThemeToggle />
            {#if $auth.isAuthenticated}
              <Link to="/dashboard">Dashboard</Link>
              <button class="nav__button" on:click={() => auth.logout()}>
                Logout
              </button>
            {:else}
              <Link to="/login">Login</Link>
            {/if}
          </div>
        </nav>

        <div class="content">
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/publications">
            <ProtectedRoute permission="read:publications">
              <Publications />
            </ProtectedRoute>
          </Route>
        </div>

        {#if $auth.isAuthenticated}
          <SessionManager />
        {/if}
      </main>
    </Router>
  </ErrorBoundary>
</QueryClientProvider>

<style>
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-primary);
    height: var(--header-height);
  }

  .nav__left {
    font-weight: 600;
    font-size: var(--font-size-lg);
  }

  .nav__right {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .nav__button {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    font-size: var(--font-size-base);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: background-color var(--transition);
  }

  .nav__button:hover {
    background-color: var(--bg-secondary);
  }

  .content {
    min-height: calc(100vh - var(--header-height));
    padding: var(--space-4);
  }
</style>