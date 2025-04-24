export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        // Utiliser new Date() directement
        const now = new Date();

        const expiredReservations = await prisma.reservation.findMany({
            where: {
                OR: [
                    {
                        reservationDate: {
                            lt: now.toISOString().split('T')[0], // Format YYYY-MM-DD
                        },
                    },
                    {
                        reservationDate: {
                            equals: now.toISOString().split('T')[0], // Format YYYY-MM-DD
                        },
                        endTime: {
                            lt: now.toTimeString().split(' ')[0], // Format HH:MM:SS
                        },
                    },
                ],
            },
        });

        if (expiredReservations.length > 0) {
            await prisma.reservation.deleteMany({
                where: {
                    id: {
                        in: expiredReservations.map((reservation) => reservation.id),
                    },
                },
            });
        }

        return NextResponse.json({ message: 'Expired reservations cleaned up' });
    } catch (error) {
        console.error('Error cleaning up reservations:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
