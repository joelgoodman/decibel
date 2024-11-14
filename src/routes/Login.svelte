<script lang="ts">
  import { navigate } from 'svelte-routing';
  import { auth } from '../lib/stores/auth';
  import Logo from '../lib/components/common/Logo.svelte';
  import LoginForm from '../lib/components/auth/LoginForm.svelte';

  $: if ($auth.isAuthenticated) {
    navigate('/dashboard');
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="header">
      <Logo />
      <h1>Welcome Back</h1>
      <p>Sign in to your account to continue</p>
    </div>

    <LoginForm />

    <div class="footer">
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  }

  .login-card {
    background: white;
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: 400px;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 1rem 0 0.5rem;
  }

  .header p {
    color: #6b7280;
    font-size: 0.975rem;
  }

  .footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .footer a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 500;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .login-card {
      padding: 1.5rem;
    }
  }
</style>