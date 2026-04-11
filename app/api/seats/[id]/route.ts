import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {id} = await context.params;

    // Get seat with floor information
    const seat = await prisma.seat.findUnique({
      where: { id: id },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            libraryId: true,
          },
        },
      },
    });

    if (!seat) {
      return NextResponse.json(
        { error: 'Seat not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this seat's library
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library || library.id !== seat.floor.libraryId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: seat.id,
        seatNo: seat.seatNo,
        isActive: seat.isActive,
        floor: {
          id: seat.floor.id,
          name: seat.floor.name,
        },
      },
    });
  } catch (error) {
    console.error('Fetch seat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch seat' },
      { status: 500 }
    );
  }
}
