import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const {id }= await context.params;

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify user's library owns this subscription
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library || subscription.libraryId !== library.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete seat assignments for this subscription
    await prisma.seatAssignment.deleteMany({
      where: {
        // Find assignments that match this subscription's seat and shifts
        seat: {
          seatNo: subscription.seatNo,
          floor: { name: subscription.floorName },
        },
      },
    });

    // Mark subscription as expired
    const updated = await prisma.subscription.update({
      where: { id: id },
      data: {
        status: 'EXPIRED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription dissociated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const body = await request.json();
    const { months = 1 } = body; // Default 1 month renewal

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify user's library owns this subscription
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library || subscription.libraryId !== library.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get shift info to calculate renewal cost
    const shifts = await prisma.shift.findMany({
      where: {
        libraryId: library.id,
        name: { in: subscription.shiftName },
      },
    });

    const renewalCost = shifts.reduce((sum, s) => sum + s.price, 0) * months;

    // Calculate new end date
    const currentEndDate = new Date(subscription.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    // Update subscription
    const updated = await prisma.subscription.update({
      where: { id: id },
      data: {
        endDate: newEndDate,
        totalAmount: subscription.totalAmount + renewalCost,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription renewed for ${months} month(s)`,
      data: {
        id: updated.id,
        endDate: updated.endDate,
        totalAmount: updated.totalAmount,
        renewalCost,
      },
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to renew subscription' },
      { status: 500 }
    );
  }
}
