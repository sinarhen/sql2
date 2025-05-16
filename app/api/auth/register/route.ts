import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/db/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate inputs
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
      role: role as 'admin' | 'lecturer' | 'student',
    }).returning({ id: users.id });

    return NextResponse.json(
      { id: newUser[0].id, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 