/**
 * Encryption utilities for sensitive financial data
 * Uses AES-256-GCM encryption with per-user key derivation
 */

import CryptoJS from 'crypto-js';

/**
 * Get the master encryption key from environment variables
 * This should be a 64-character hex string (32 bytes)
 */
function getMasterKey(): string {
  const key = process.env.NEXT_PUBLIC_DATA_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('DATA_ENCRYPTION_KEY not found in environment variables');
  }
  
  if (key.length < 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be at least 32 characters');
  }
  
  return key;
}

/**
 * Derive a user-specific encryption key from the master key and user ID
 * This ensures each user's data is encrypted with a unique key
 */
function deriveUserKey(userId: string): string {
  const masterKey = getMasterKey();
  
  // Use PBKDF2 to derive a user-specific key
  const derivedKey = CryptoJS.PBKDF2(masterKey + userId, userId, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  
  return derivedKey.toString();
}

/**
 * Encrypt a value using AES-256
 * @param value - The plaintext value to encrypt
 * @param userId - The user ID to derive the encryption key
 * @returns Encrypted string (base64 encoded)
 */
export function encrypt(value: string | number, userId: string): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  try {
    const userKey = deriveUserKey(userId);
    const stringValue = String(value);
    
    // Encrypt using AES-256
    const encrypted = CryptoJS.AES.encrypt(stringValue, userKey);
    
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a value using AES-256
 * @param encryptedValue - The encrypted value (base64 encoded)
 * @param userId - The user ID to derive the encryption key
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedValue: string, userId: string): string {
  if (!encryptedValue || encryptedValue === '') {
    return '';
  }
  
  try {
    const userKey = deriveUserKey(userId);
    
    // Decrypt using AES-256
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, userKey);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return empty string for failed decryption to handle migration gracefully
    return '';
  }
}

/**
 * Encrypt transaction data before storing
 */
export function encryptTransactionData(
  transaction: {
    amount: number;
    description: string;
  },
  userId: string
): {
  amount_encrypted: string;
  description_encrypted: string;
} {
  return {
    amount_encrypted: encrypt(transaction.amount, userId),
    description_encrypted: encrypt(transaction.description, userId),
  };
}

/**
 * Decrypt transaction data after fetching
 */
export function decryptTransactionData(
  encryptedTransaction: {
    amount_encrypted?: string;
    description_encrypted?: string;
    amount?: string | number; // For backward compatibility
    description?: string; // For backward compatibility
  },
  userId: string
): {
  amount: number;
  description: string;
} {
  try {
    // Handle encrypted data
    const amountStr = encryptedTransaction.amount_encrypted
      ? decrypt(encryptedTransaction.amount_encrypted, userId)
      : String(encryptedTransaction.amount || '0');
    
    const description = encryptedTransaction.description_encrypted
      ? decrypt(encryptedTransaction.description_encrypted, userId)
      : String(encryptedTransaction.description || '');
    
    return {
      amount: parseFloat(amountStr) || 0,
      description: description,
    };
  } catch (error) {
    console.error('Transaction decryption error:', error);
    // Return safe defaults
    return {
      amount: 0,
      description: '',
    };
  }
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    getMasterKey();
    return true;
  } catch {
    return false;
  }
}

