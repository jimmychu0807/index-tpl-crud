// 3rd-party libs
import jQueryFactory = require('jquery')
import jsdom = require('jsdom')

// Node modules
import fs = require('fs')

const { JSDOM } = jsdom

export function preprocess (inputPath: string): [jsdom.JSDOM, JQueryStatic] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`input file ${inputPath} does not exist`)
  }

  const inputStr = fs.readFileSync(inputPath)
  const jsdom = new JSDOM(inputStr)
  const $ = jQueryFactory(jsdom.window as unknown as Window, true)
  return [jsdom, $]
}
