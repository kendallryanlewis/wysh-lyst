const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const ITERATIONS = 100000

export interface EncryptedData {
  ciphertext: string
  iv: string
  salt: string
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(plaintext: string, passphrase: string): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  
  const key = await deriveKey(passphrase, salt)
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  }
}

export async function decryptData(
  encryptedData: EncryptedData,
  passphrase: string
): Promise<string> {
  const decoder = new TextDecoder()
  const saltBuffer = base64ToArrayBuffer(encryptedData.salt)
  const ivBuffer = base64ToArrayBuffer(encryptedData.iv)
  const ciphertextBuffer = base64ToArrayBuffer(encryptedData.ciphertext)

  const salt = new Uint8Array(saltBuffer)
  const iv = new Uint8Array(ivBuffer)
  const ciphertext = new Uint8Array(ciphertextBuffer)

  const key = await deriveKey(passphrase, salt)

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    )
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    throw new Error('Decryption failed. Invalid passphrase or corrupted data.')
  }
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '••••••••'
  }
  const prefix = key.slice(0, 3)
  const suffix = key.slice(-4)
  return `${prefix}••••••••${suffix}`
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
