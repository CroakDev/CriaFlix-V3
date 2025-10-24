"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react' // Importando ícone de carregamento
import { Icon } from '@iconify/react';

function LoginForm() {
    const router = useRouter();
    const [loadingButton, setLoadingButton] = useState<string | null>(null);

    const handleLogin = async (provider: string) => {
        setLoadingButton(provider);

        try {
            // Inicia o processo de login com o provedor selecionado
            await signIn(provider, { 
                redirect: true,
                callbackUrl: `/home`, // Redireciona para a página inicial após o login
            });
        } catch (error) {
            // Opcional: Lide com o erro se necessário
        } finally {
            // Não há necessidade de definir loadingButton como null aqui, pois o redirecionamento é feito automaticamente
        }
    };

    return (
        <div className="flex flex-col items-center space-y-5">
            <Button
                onClick={() => handleLogin("github")}
                disabled={loadingButton === "github"}
                className="flex items-center justify-center"
            >
                {loadingButton === "github" ? (
                    <Loader2 className="animate-spin mr-2" size={20} /> // Ícone de carregamento
                ) : (
                    <Icon icon="mdi:github" className="mr-2" width={20} /> // Ícone padrão do GitHub
                )}
                {loadingButton === "github" ? "Loading..." : "Login with GitHub"}
            </Button>

            <Button
                className='bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600'
                onClick={() => handleLogin("discord")}
                disabled={loadingButton === "discord"}
            >
                {loadingButton === "discord" ? (
                    <Loader2 className="animate-spin mr-2" size={20} /> // Ícone de carregamento
                ) : (
                    <Icon icon="ic:baseline-discord" className="mr-2" width={20} /> // Ícone padrão do Discord
                )}
                {loadingButton === "discord" ? "Loading..." : "Login with Discord"}
            </Button>

            <Button
                className='bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900'
                onClick={() => handleLogin("google")}
                disabled={loadingButton === "google"}
            >
                {loadingButton === "google" ? (
                    <Loader2 className="animate-spin mr-2" size={20} /> // Ícone de carregamento
                ) : (
                    <Icon icon="mdi:google" className="mr-2" width={20} /> // Ícone padrão do Google
                )}
                {loadingButton === "google" ? "Loading..." : "Login with Google"}
            </Button>
        </div>
    )
}

export default LoginForm;
