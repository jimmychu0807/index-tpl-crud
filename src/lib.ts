// Load order is important here. Need to load `jsdom` and `jsdom-global` first, then `cash-dom`
// can be used, as it expects a browser environment with `window` and `document`.
const { JSDOM } = require('jsdom')
require('jsdom-global')()
import $, { Cash } from 'cash-dom'

// Internal Import
import { TPL_PATH, CliUpsertOptions, CliRmOptions } from './consts_types'

const fs = require('fs')
const ejs = require('ejs')

// Constant definition
const RUSTDOC_LIST_ID = '#rustdoc-list'
const LATEST_DOM_ID = '#latest'

export function generateIndex (
  ghRepo: string,
  projectName: string,
  outputPath: string
): void {
  const tplStr = fs.readFileSync(TPL_PATH, { encoding: 'utf8', flag: 'r' })
  const output = ejs.render(tplStr, { ghRepo, projectName })
  fs.writeFileSync(outputPath, output)
}

export function upsertIndex (
  inputPath: string,
  ref: string,
  display: string,
  opts: CliUpsertOptions
): void {
  const [dom, collection] = preprocess(inputPath)
  const { latest } = opts
  const ghRepo = getRepo(collection)

  // Remove the existing latest alias if needed
  if (latest) {
    $(LATEST_DOM_ID, collection).each((ind, el) => { $(el).html('') })
  }

  // Check if such <li /> child exists already
  const ul = $(`ul#${RUSTDOC_LIST_ID}`, collection).first()
  const children = ul.children('li').filter((ind, li) =>
    $(li).filter(`a[href$="/${ghRepo}/${regexpEscape(ref)}"]`).length > 0
  )

  // Upsert content in the ul
  children.length === 0
    ? ul.append(renderLiInner(ghRepo, ref, display, latest))
    : children.replaceWith(renderLiInner(ghRepo, ref, display, latest))

  // sort the `ul` children
  const sortedLiArr = Array.from(ul.get(0)!.children)
    .sort((el1, el2) => {
      const textEl1 = $(el1).text().toLowerCase()
      const textEl2 = $(el2).text().toLowerCase()
      return textEl1 === textEl2
        ? 0
        : textEl1 >= textEl2 ? 1 : -1
    })

  ul.html(sortedLiArr.map(li => li.outerHTML).join(''))
  // Save back to the file
  fs.writeFileSync(inputPath, dom.serialize())
}

export function rmIndex (inputPath: string, ref: string, opts: CliRmOptions): void {
  const [dom, collection] = preprocess(inputPath)
  const { latest } = opts
  const ghRepo = getRepo(collection)

  // Check if such <li /> child exists already
  const ul = $(`ul#${RUSTDOC_LIST_ID}`, collection).first()
  latest
    ? ul.children(LATEST_DOM_ID).html('')
    : ul.children(`li a[href$="/${ghRepo}/${regexpEscape(ref)}"]`).html('')

  // Save back to the file
  fs.writeFileSync(inputPath, dom.serialize())
}

function preprocess (inputPath: string): [any, Cash] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`input file ${inputPath} does not exist`)
  }

  const inputStr = fs.readFileSync(inputPath)
  return [new JSDOM(inputStr), $(inputStr)]
}

function getRepo (collection: Cash): string {
  const selected = $(RUSTDOC_LIST_ID, collection)
  if (!selected || selected.length === 0) {
    throw new Error(`Input html doesn't contain DOM ID: ${RUSTDOC_LIST_ID}`)
  }

  return $(selected[0]).data('gh-repo')
}

function renderLiInner (repo: string, ref: string, display: string, latest: boolean = false) {
  return latest
    ? `<a href="/${repo}/${ref}">${display}</a><span id="latest"> (<a href="/${repo}/latest">latest</a>)</span>`
    : `<a href="/${repo}/${ref}">${display}</a>`
}

function regexpEscape (val: string): string {
  return val.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}
