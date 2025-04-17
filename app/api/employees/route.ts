import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: "L'identifiant de l'entreprise est manquant." }, { status: 400 });
    }

    const employees = await prisma.user.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        email: true,
        givenName: true,
        famillyName: true, // corrigé ici
      },
    });

    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
      },
      select: {
        name: true,
      },
    });

    const formattedEmployees = employees.map((employee) => ({
      id: employee.id,
      email: employee.email,
      givenName: employee.givenName || null,
      familyName: employee.famillyName || null,
    }));

    return NextResponse.json(
      {
        employees: formattedEmployees,
        companyName: company?.name || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/employees:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
