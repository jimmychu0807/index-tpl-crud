// Load order is important here. Need to load `jsdom` and `jsdom-global` first, then `cash-dom`
// can be used, as it expects a browser environment with `window` and `document`.
import jQueryFactory = require('jquery')
// Internal Import
import { TPL_PATH, CliUpsertOptions } from './consts_types'

const { JSDOM } = require('jsdom')
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
  const [jsdom, $] = preprocess(inputPath)
  const { latest } = opts
  const ghRepo: string = $(RUSTDOC_LIST_ID).data('gh-repo')

  // Remove the existing latest alias if needed
  if (latest && $(LATEST_DOM_ID).length > 0) {
    $(LATEST_DOM_ID).each((ind, el) => { el.outerHTML = '' })
  }

  // Check if such <li /> child exists already
  const ul = $(RUSTDOC_LIST_ID).first()
  const children = ul.children('li').filter((ind, li) =>
    $(li).children(`a[href$="/${ghRepo}/${ref}"]`).length > 0
  )

  // Upsert content in the ul
  children.length === 0
    ? ul.append(renderLi(ghRepo, ref, display, latest))
    : children.replaceWith(renderLi(ghRepo, ref, display, latest))

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
  fs.writeFileSync(inputPath, jsdom.serialize())
}

export function rmIndex (inputPath: string, ref: string): void {
  const [jsdom, $] = preprocess(inputPath)
  const ghRepo: string = $(RUSTDOC_LIST_ID).data('gh-repo')

  // Check if such <li /> child exists already
  const ul = $(RUSTDOC_LIST_ID).first()
  const children = ul.children('li').filter((ind, li) =>
    $(li).children(`a[href$="/${ghRepo}/${ref}"]`).length > 0
  )

  children.each((ind, li) => { li.outerHTML = '' })
  // Save back to the file
  fs.writeFileSync(inputPath, jsdom.serialize())
}

function preprocess (inputPath: string): [any, JQueryStatic] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`input file ${inputPath} does not exist`)
  }

  const inputStr = fs.readFileSync(inputPath)
  const jsdom = new JSDOM(inputStr)
  const jQuery = jQueryFactory(jsdom.window, true)
  return [jsdom, jQuery]
}

function renderLi (repo: string, ref: string, display: string, latest: boolean = false) {
  return latest
    ? `<li><a href="/${repo}/${ref}">${display}</a><span id="latest"> (<a href="/${repo}/latest">latest</a>)</span></li>`
    : `<li><a href="/${repo}/${ref}">${display}</a></li>`
}
