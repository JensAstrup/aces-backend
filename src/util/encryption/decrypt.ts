import { createDecipheriv } from 'crypto'


function decrypt(encryptedData: string): string {
  const key = process.env.ENCRYPTION_KEY!
  const [ivHex, encrypted] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export default decrypt
