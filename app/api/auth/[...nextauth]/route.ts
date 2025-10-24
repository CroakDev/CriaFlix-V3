import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: 'Ov23liLPD6JeFe2hIZZL',
      clientSecret: 'bba3baa65ede94594e179eb00d31c4d0137feb1f',
    }),
    DiscordProvider({
      clientId: '1264757195778560082',
      clientSecret: '3lqgxrZgtiZTWKU3AWft2GIv9p4W7tX1',
    }),
    GoogleProvider({
      clientId: '616895644389-euch9i5ln97btg563ds43gvl6kds497k.apps.googleusercontent.com',
      clientSecret: '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',
    }),
  ],
  pages: {
    signIn: '/', // Página de login
  },
 
  
});

export { handler as GET, handler as POST };
