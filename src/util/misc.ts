/**
 * Miscellaneous shared functions go here.
 */


/**
 * Get a random number between 1 and 1,000,000,000,000
 */
export function getRandomInt(): number {
  const ONE_TRILLION = 1_000_000_000_000
  return Math.floor(Math.random() * ONE_TRILLION)
}

/**
 * Wait for a certain number of milliseconds.
 */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}
