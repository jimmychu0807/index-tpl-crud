// Internal Import
import { TPL_PATH, CliUpsertOptions, CliRmOptions } from './consts_types'
const { JSDOM } = require('jsdom')

const fs = require('fs')
const ejs = require('ejs')

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
  const [dom, ul, ghRepo] = preprocess(inputPath)
  const { document } : { document: Document } = dom.window
  const { latest } = opts

  // Remove the existing latest alias if needed
  if (latest) {
    const latestElm = document.getElementById('latest')
    if (latestElm) latestElm.outerHTML = ''
  }

  // Check if such <li /> child exists already
  const children = Array.from(ul.children)
    .filter((el) => el.children[0]
      ? el.children[0].getAttribute('href')?.match(new RegExp(`/${ghRepo}/${ref}/?$`, 'i'))
      : false
    )

  // Upsert content in the ul
  if (children.length === 0) {
    // Update li
    const li: HTMLElement = document.createElement('li')
    li.innerHTML = renderLiInner(ghRepo, ref, display, latest)
    ul.append(li)
  } else {
    // Insert li
    children[0].innerHTML = renderLiInner(ghRepo, ref, display, latest)
  }

  // sort the `ul` children
  const sortedLiArr = Array.from(ul.children)
    .sort((el1, el2) => {
      const textEl1 = el1.children[0]!.textContent!.toLowerCase()
      const textEl2 = el2.children[0]!.textContent!.toLowerCase()
      if (textEl1 === textEl2) return 0
      return textEl1 >= textEl2 ? 1 : -1
    })

  ul.innerHTML = sortedLiArr.map(li => li.outerHTML).join('')

  // Save back to the file
  fs.writeFileSync(inputPath, dom.serialize())
}

export function rmIndex (inputPath: string, ref: string, opts: CliRmOptions): void {
  const [dom, ul, ghRepo] = preprocess(inputPath)
  const { latest } = opts

  // Check if such <li /> child exists already
  const children = Array.from(ul.children)
    .filter((el) => el.children[0]
      ? el.children[0].getAttribute('href')?.match(new RegExp(`/${ghRepo}/${ref}/?$`, 'i'))
      : false
    )
  // Such element doesn't exist
  if (children.length === 0) return

  const li = children[0]

  if (latest) {
    // Aim to remove the latest alias only
    const latestLi = li.querySelector('#latest')
    if (latestLi) latestLi.outerHTML = ''
  } else {
    // Remove the whole <li /> element
    li.outerHTML = ''
  }

  // Save back to the file
  fs.writeFileSync(inputPath, dom.serialize())
}

function preprocess (inputPath: string): [any, HTMLElement, string] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`input file ${inputPath} does not exist`)
  }

  const inputStr = fs.readFileSync(inputPath)
  const dom = new JSDOM(inputStr)
  const { document } : { document: Document } = dom.window

  const ul = document.getElementById('rustdoc-list')
  if (!ul) {
    throw new Error('\'rustdoc-list\' ID selection returns null')
  }

  // Get the `data-gh-repo` attribute field`
  const { ghRepo } = ul.dataset
  if (!ghRepo) {
    throw new Error('\'data-gh-repo\' data attribute missing in the <ul/> element')
  }

  return [dom, ul, ghRepo]
}

function renderLiInner (repo: string, ref: string, display: string, latest: boolean = false) {
  return latest
    ? `<a href="/${repo}/${ref}">${display}</a><span id="latest"> (<a href="/${repo}/latest">latest</a>)</span>`
    : `<a href="/${repo}/${ref}">${display}</a>`
}
