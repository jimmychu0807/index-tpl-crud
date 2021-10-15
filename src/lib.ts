// Internal Import
import { TPL_PATH } from './consts_types'
const { JSDOM } = require('jsdom')

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

async function upsertIndex (inputPath: string, ref: string, display: string): Promise<void> {
  if (! fs.existsSync(inputPath)) {
    throw `input file ${inputPath} does not exist`
  }

  const inputStr = fs.readFileSync(inputPath)
  const dom = new JSDOM(inputStr)
  const { document } : { document: Document } = dom.window

  let ul = document.getElementById('rustdoc-list')
  if (! ul) {
    throw `'rustdoc-list' ID selection returns null`
  }

  const { ghRepo } = ul.dataset
  const children = Array.from(ul.children)
    .filter((el) =>
      el.children[0]
        ? el.children[0].getAttribute('href')?.match(new RegExp(`/${ghRepo}/${ref}/?$`, 'i'))
        : false
    )

  if (children.length === 0) {
    let li: HTMLElement = document.createElement('li')
    li.innerHTML = `<a href="/${ghRepo}/${ref}">${display}</a>`
    ul.append(li)
  } else {
    children[0].innerHTML = `<a href="/${ghRepo}/${ref}">${display}</a>`
  }

  // sort the `ul` children
  Array.from(ul.children).sort((el1, el2) => {
    if (el1.children[0]!.innerHTML === el2.children[0]!.innerHTML) return 0;
    return el1.children[0]!.innerHTML >= el2.children[0]!.innerHTML ? 1 : -1;
  })

  // Save back to the file
  fs.writeFileSync(inputPath, dom.serialize())
}

export {
  generateIndex,
  upsertIndex
}
