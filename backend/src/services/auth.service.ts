import pool from "../config/database";
import { hashPassword, verifyPassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import {
  SignupBody,
  LoginBody,
  AuthResponse,
  UserRow,
} from "../types/auth.types";

// ── Validation helpers ─────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePassword(password: string): string | null {
  if (password.length < 8)      return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))  return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password))  return "Password must contain at least one number.";
  return null;
}

// ── Signup ─────────────────────────────────────────────────────────────────

export async function signup(body: SignupBody): Promise<AuthResponse> {
  const { username, email, password } = body;

  // Field-level validation
  if (!username || !email || !password) {
    throw { status: 400, message: "username, email, and password are required." };
  }
  if (!validateUsername(username)) {
    throw { status: 400, message: "Username must be 3–20 characters (letters, numbers, underscores)." };
  }
  if (!validateEmail(email)) {
    throw { status: 400, message: "Invalid email address." };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw { status: 400, message: passwordError };
  }

  // Uniqueness check — one query for both to give a precise error
  const existing = await pool.query<{ field: string }>(
    `SELECT 'email' AS field FROM users WHERE email = $1
     UNION ALL
     SELECT 'username' AS field FROM users WHERE username = $2
     LIMIT 1`,
    [email.toLowerCase(), username]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    const field = existing.rows[0].field;
    throw {
      status: 409,
      message: field === "email"
        ? "An account with this email already exists."
        : "This username is already taken.",
    };
  }

  // Persist
  const passwordHash = await hashPassword(password);
  const result = await pool.query<UserRow>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at, updated_at`,
    [username, email.toLowerCase(), passwordHash]
  );
  const user = result.rows[0];

  const token = signToken({ sub: user.id, email: user.email, username: user.username });
  return { token, user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at, updated_at: user.updated_at } };
}

// ── Login ──────────────────────────────────────────────────────────────────

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { email, password } = body;

  if (!email || !password) {
    throw { status: 400, message: "email and password are required." };
  }

  const result = await pool.query<UserRow>(
    `SELECT id, username, email, password_hash, created_at, updated_at
     FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()]
  );

  // Use generic message — don't reveal whether email exists
  const INVALID = { status: 401, message: "Invalid email or password." };

  if (!result.rowCount || result.rowCount === 0) throw INVALID;

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw INVALID;

  const token = signToken({ sub: user.id, email: user.email, username: user.username });
  return { token, user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at, updated_at: user.updated_at } };
}
