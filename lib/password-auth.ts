import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const PASSWORD_HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `${PASSWORD_HASH_PREFIX}:${salt}:${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) {
    return false;
  }

  const [prefix, salt, storedHash] = passwordHash.split(':');

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const storedHashBuffer = Buffer.from(storedHash, 'base64url');
  const derivedKey = (await scrypt(password, salt, storedHashBuffer.length)) as Buffer;

  return (
    storedHashBuffer.length === derivedKey.length &&
    timingSafeEqual(storedHashBuffer, derivedKey)
  );
}
