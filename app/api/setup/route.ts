import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { email, username, country } = body;

  console.log('Received data:', body); // Adicione este log

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let user;
    if (existingUser) {
      // Se o usuário já existir, atualize os dados
      user = await prisma.user.update({
        where: { email },
        data: {
          name: username,
          country,
          isSetupComplete: true,
        },
      });
    } else {
      // Se o usuário não existir, crie um novo
      user = await prisma.user.create({
        data: {
          email,
          name: username,
          country,
          isSetupComplete: true,
        },
      });
    }

    return NextResponse.json({ message: "Setup completed", user });
  } catch (error) {
    console.error("Error configuring the account:", error);
    return NextResponse.json({ error: `Failed to complete setup: ${error}` }, { status: 500 });
  }
}
