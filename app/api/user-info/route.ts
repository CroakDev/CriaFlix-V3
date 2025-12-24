import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET() {
    // Obtém a sessão do NextAuth diretamente
    const session = await getServerSession();
  
    // Verifica se o usuário está autenticado
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  
    // Pega o email do usuário a partir da sessão
    const email = session.user.email;
  
    try {
      // Busca o usuário no banco de dados pelo email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { isVip: true }, // Seleciona o campo isVip
      });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Retorna o status isVip
      return NextResponse.json({ isVip: user.isVip });
    } catch (error) {
      console.error('Error fetching user info:', error);
      return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
    }
  }
