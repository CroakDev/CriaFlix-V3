import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  // For now, we'll keep it as 'pt', but this can be made dynamic
  const locale = 'pt';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
