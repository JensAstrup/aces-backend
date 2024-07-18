/**
 * Remove old files, copy front-end ones.
 */

import childProcess from 'child_process'

import fs from 'fs-extra'


/**
 * Start
 */
(async (): Promise<void> => {
  try {
    // Remove current build
    await remove('./dist/')
    // Copy back-end files
    await exec('tsc --build tsconfig.prod.json', './')
  }
  catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.remove(loc, (err) => {
      !!err ? rej(err) : res()
    })
  })
}


/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (!!stdout) {
        console.info(stdout)
      }
      if (!!stderr) {
        console.warn(stderr)
      }
      !!err ? rej(err) : res()
    })
  })
}
