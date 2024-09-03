import { csrfSync } from 'csrf-sync'


const { generateToken } = csrfSync()

export const generateCsrfToken = generateToken
