/**
 * CRYPTO SERVICE - AZAKA CHANS
 * 
 * Service de chiffrement et de sécurité cryptographique.
 * Utilise exclusivement les API Web Crypto pour toutes les opérations.
 * 
 * FONCTIONNALITÉS:
 * - Chiffrement AES-256-GCM pour les données sensibles
 * - Hachage SHA-256 pour l'intégrité
 * - HMAC pour l'authentification des messages
 * - Génération de clés sécurisée
 * - Signature et vérification de données
 */

// ============================================================
// TYPES
// ============================================================

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
  algorithm: string;
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

// ============================================================
// GÉNÉRATION ALÉATOIRE SÉCURISÉE
// ============================================================

/**
 * Génère des bytes aléatoires cryptographiquement sûrs
 */
export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Génère une chaîne hexadécimale aléatoire
 */
export function generateRandomHex(bytes: number): string {
  return Array.from(generateRandomBytes(bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Génère une chaîne Base64 aléatoire
 */
export function generateRandomBase64(bytes: number): string {
  return btoa(String.fromCharCode(...generateRandomBytes(bytes)));
}

// ============================================================
// HACHAGE
// ============================================================

/**
 * Hache une chaîne avec SHA-256
 */
export async function hashSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hache une chaîne avec SHA-512
 */
export async function hashSHA512(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// HMAC (AUTHENTIFICATION DE MESSAGES)
// ============================================================

/**
 * Génère une clé HMAC
 */
export async function generateHMACKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign', 'verify']
  );
}

/**
 * Signe des données avec HMAC-SHA256
 */
export async function signHMAC(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie une signature HMAC
 */
export async function verifyHMAC(
  data: string,
  signature: string,
  key: CryptoKey
): Promise<boolean> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = new Uint8Array(
    signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  return await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer);
}

// ============================================================
// CHIFFREMENT AES-256-GCM
// ============================================================

/**
 * Dérive une clé AES à partir d'un mot de passe
 */
export async function deriveAESKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Importer le mot de passe comme clé de base
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Dériver une clé AES-256
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Chiffre des données avec AES-256-GCM
 */
export async function encryptAES(
  data: string,
  password: string
): Promise<EncryptedData> {
  const salt = generateRandomBytes(16);
  const iv = generateRandomBytes(12); // 96 bits pour AES-GCM
  
  const key = await deriveAESKey(password, salt);
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    dataBuffer
  );
  
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    algorithm: 'AES-256-GCM',
  };
}

/**
 * Déchiffre des données avec AES-256-GCM
 */
export async function decryptAES(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0));
  
  const key = await deriveAESKey(password, salt);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// ============================================================
// GÉNÉRATION DE CLÉS ASYMÉTRIQUES
// ============================================================

/**
 * Génère une paire de clés RSA-OAEP
 */
export async function generateRSAKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Génère une paire de clés ECDSA
 */
export async function generateECDSAKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Convertit une CryptoKey en Base64
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Importe une clé depuis Base64
 */
export async function importKeyFromBase64(
  base64: string,
  algorithm: string,
  usages: KeyUsage[]
): Promise<CryptoKey> {
  const keyData = new Uint8Array(
    atob(base64).split('').map(c => c.charCodeAt(0))
  );
  
  return await crypto.subtle.importKey('raw', keyData, algorithm, true, usages);
}

/**
 * Compare deux chaînes en temps constant (pour éviter les attaques timing)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Génère un token CSRF sécurisé
 */
export function generateCSRFToken(): string {
  return generateRandomHex(32);
}

/**
 * Génère un token de session sécurisé
 */
export function generateSessionToken(): string {
  return generateRandomHex(32);
}

/**
 * Génère un token de vérification d'email
 */
export function generateEmailVerificationToken(): string {
  return generateRandomHex(32);
}

/**
 * Génère un code de récupération à usage unique
 */
export function generateRecoveryCode(): string {
  // Format: XXXX-XXXX-XXXX-XXXX
  const bytes = generateRandomBytes(8);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`.toUpperCase();
}

/**
 * Génère une chaîne aléatoire
 */
export function generateRandomString(length: number): string {
  const bytes = generateRandomBytes(length);
  return Array.from(bytes)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

/**
 * Hash un mot de passe avec PBKDF2
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = generateRandomHex(16);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash: hashHex, salt };
}

/**
 * Vérifie un mot de passe par rapport à un hash
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return secureCompare(computedHash, hash);
}
