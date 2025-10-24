// ClientComponent.tsx
"use client"; // Marca como Client Component

import { NextIntlClientProvider } from 'next-intl'; // Para internacionalização
import { SessionProvider } from 'next-auth/react'; // Para gestão de sessões
import { Toaster } from "@/components/ui/sonner"; // Exemplo de componente adicional
import { Suspense } from 'react';
import Providers from "./components/Provider"; // Se você tiver um provedor personalizado

interface ClientComponentProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>; // Tipo das mensagens
  session?: any; // Tipo de sessão (opcional)
}

export default function ClientComponent({
  children,
  locale,
  messages,
  session,
}: ClientComponentProps) {
  return (
    <SessionProvider session={session ?? undefined}> {/* Provedor de sessão */}
      <main>
        <NextIntlClientProvider locale={locale} messages={messages}> {/* Provedor de internacionalização */}
          <Providers>{children}</Providers> {/* Seu provedor customizado */}
        </NextIntlClientProvider>
        <Toaster /> {/* Exemplo de toaster ou qualquer outro componente UI */}
      </main>
    </SessionProvider>
  );
}
