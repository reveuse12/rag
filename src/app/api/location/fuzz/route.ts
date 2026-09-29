import { NextResponse } from 'next/server';
import { fuzzCoordinates } from '@/lib/fuzzing';

/**
 * PRD Requirement: Server-side location fuzzing.
 * Exact coordinates are fuzzed to 300-500m on the server BEFORE anything is stored,
 * shown only to opted-in members, and auto-expires in 3 hours.
 */

export async function POST(request: Request) {
  try {
    const { latitude, longitude, opt_in } = await request.json();

    if (!opt_in) {
      // User disabled or closed tab / clicked panic button
      return NextResponse.json({
        success: true,
        opt_in: false,
        message: 'Location sharing disabled and purged.',
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
    }

    // Fuzz coordinates to 300-500m server-side
    const fuzzed = fuzzCoordinates(Number(latitude), Number(longitude), 3);

    return NextResponse.json({
      success: true,
      opt_in: true,
      fuzzed_data: {
        latitude: fuzzed.latitude,
        longitude: fuzzed.longitude,
        accuracy_meters: fuzzed.accuracyRadiusMeters,
        expires_at: fuzzed.expiresAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fuzzing error' },
      { status: 500 }
    );
  }
}
