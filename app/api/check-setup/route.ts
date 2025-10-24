import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        // Obtendo o email da requisição
        const { email } = await request.json();

        // Buscando o usuário diretamente aqui
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Retornando se a configuração está completa
            const isSetupComplete = user.isSetupComplete;
            return NextResponse.json({ isSetupComplete });
        } else {
            // Caso o usuário não seja encontrado
            return NextResponse.json({ isSetupComplete: false });
        }
    } catch (error) {
        console.error('Error in check-setup API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
