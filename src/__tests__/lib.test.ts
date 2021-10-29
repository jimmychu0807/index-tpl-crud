// Node.js modules
import fs = require('fs')

// Module to actually test
import {
  generateIndex, upsertIndex,
  rmIndex as _rmIndex
} from '../lib'

import { preprocess } from '../utils'

const outPath = '/tmp/index-tpl-crud-test.html'
const projectTitle = 'Test Project'
const projectRepo = 'test-project'
const refsAndDisplay = [
  ['v3+monthly-2021-10', 'monthly 2021-10'],
  ['v3+monthly-2021-09+1', 'monthly 2021-09'],
  ['v3+monthly-2021-11', 'monthly 2021-11'],
]

const checkExistsAndUnlink = (outPath: string): void => {
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
}

describe('Testing `generateIndex`...', () => {
  beforeEach(() => { checkExistsAndUnlink(outPath) })
  afterAll(() => { checkExistsAndUnlink(outPath) })

  test('generating the proper file.', () => {
    generateIndex(projectRepo, projectTitle, outPath)

    // Expect the file have been written to
    expect(fs.existsSync(outPath)).toEqual(true)

    const [, $] = preprocess(outPath)
    // Test the title
    expect($('h1').text()).toEqual(`${projectTitle} Rustdocs`)

    // Test there is a <ul> element
    expect($('ul').length).toEqual(1)
    const $ul = $('ul').first()

    // Test the ul `id` and `data-gh-repo` attribute
    expect($ul.attr('id')).toEqual('rustdoc-list')
    expect($ul.data('gh-repo')).toEqual(projectRepo)
  })
})

describe('Testing `upsertIndex`...', () => {
  beforeEach(() => {
    checkExistsAndUnlink(outPath)
    generateIndex(projectRepo, projectTitle, outPath)
  })
  afterAll(() => { checkExistsAndUnlink(outPath) })

  test('insert an <li> elements', () => {
    const ref = refsAndDisplay[0][0];
    const display = refsAndDisplay[0][1];
    const id = '#rustdoc-list'

    upsertIndex(outPath, ref, ref, { latest: false })

    const [, $] = preprocess(outPath)

    // Test there is an <li/> element added
    expect($(id).find('li').length).toEqual(1)
    let $a = $(id).find('li a').first()
    expect($a.attr('href')).toEqual(`/${projectRepo}/${ref}`)
    expect($a.text()).toEqual(ref)

    // Call the 2nd time. This should replace the original one
    upsertIndex(outPath, ref, display, { latest: false })

    const [, jq] = preprocess(outPath)

    // Test there is an <li/> element added. No new <li/> element should be inserted
    expect(jq(id).find('li').length).toEqual(1)
    $a = jq(id).find('li a').first()
    expect($a.attr('href')).toEqual(`/${projectRepo}/${ref}`)
    expect($a.text()).toEqual(display)

    // Call the 3rd time. This should have the latest added. Test `{ latest: true }`
    upsertIndex(outPath, ref, display, { latest: true })

    const [, jq2] = preprocess(outPath)

    // Test there is an <li/> element added. No new <li/> element should be inserted
    expect(jq2(id).find('li').length).toEqual(1)
    $a = jq2(id).find('li').find('a')
    expect($a.length).toEqual(2)

    const [$el1, $el2] = $a.toArray().map(el => jq2(el))
    expect($el1.attr('href')).toEqual(`/${projectRepo}/${ref}`)
    expect($el1.text()).toEqual(display)

    expect($el2.attr('href')).toEqual(`/${projectRepo}/latest`)
    expect($el2.text()).toEqual('latest')
  })

  test('insert multiple <li/> elements', () => {
    const id = '#rustdoc-list'

    refsAndDisplay.forEach(([ref, display]) => {
      upsertIndex(outPath, ref, display, { latest: false })
    })

    const [, $] = preprocess(outPath)

    // There should be three <li/> elements, in sorted order
    expect($(id).find('li').length).toEqual(3)

    const $a = $(id).find('li a')
    const refs = refsAndDisplay.map(el => el[0])
    const display = refsAndDisplay.map(el => el[1])

    const [aRefs, aDisplay] = [
      $a.toArray().map(a => $(a).attr('href')),
      $a.toArray().map(a => $(a).text())
    ]

    // Should exist all 3 links and display
    expect(refs.every(ref => aRefs.includes(`/${projectRepo}/${ref}`))).toEqual(true)
    expect(display.every(dOne => aDisplay.includes(dOne))).toEqual(true)

    // display should be in sorted order
    expect(aDisplay).toEqual(display.sort())
  })
})
