(() => {
  let preference = 'system';
  try {
    const stored = localStorage.getItem('pdfdivider-theme');
    if (stored === 'system' || stored === 'light' || stored === 'dark') preference = stored;
  } catch {}
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = preference === 'system' ? (dark ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]').content = resolved === 'dark' ? '#151517' : '#f5f5f7';
})();
