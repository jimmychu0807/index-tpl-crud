// Internal Import
import { TPL_PATH } from './consts_types'

const fs = require('fs')
const ejs = require('ejs')

function generateIndex (
  ghRepo: string,
  projectName: string,
  outputPath: string
): void {
  const tplStr = fs.readFileSync(TPL_PATH, { encoding: 'utf8', flag: 'r' })
  const output = ejs.render(tplStr, { ghRepo, projectName })
  fs.writeFileSync(outputPath, output)
}

export {
  generateIndex
}
