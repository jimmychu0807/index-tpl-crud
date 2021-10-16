const path = require('path')

export const TPL_PATH = path.resolve(__dirname, 'templates/template.ejs')

export interface CliUpsertOptions {
  latest: boolean
}

export interface CliRmOptions {
  latest: boolean
}
