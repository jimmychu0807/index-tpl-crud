// Node.js modules
import fs = require('fs')

// Module to actually test
import {
  generateIndex,
  upsertIndex as _upsertIndex,
  rmIndex as _rmIndex
} from '../lib'

import { preprocess } from '../utils'

const tmpOutputPath = '/tmp/index-tpl-crud-test.html'
const projectTitle = 'Test Project'
const projectRepo = 'test-project'

describe('Testing `generateIndex`...', () => {

  beforeEach(() => {
    if (fs.existsSync(tmpOutputPath)) {
      fs.unlinkSync(tmpOutputPath)
    }
  })

  test('generating the proper file.', () => {
    generateIndex(projectRepo, projectTitle, tmpOutputPath)

    // Expect the file have been written to
    expect(fs.existsSync(tmpOutputPath)).toEqual(true)

    const [_jsdom, $] = preprocess(tmpOutputPath)
    // Test the title
    expect($('h1').text()).toEqual(`${projectTitle} Rustdocs`)

    // Test there is a ul
    expect($('ul').length).toEqual(1)
    const $ul = $('ul').first()
    expect($ul.attr('id')).toEqual('rustdoc-list')
    expect($ul.data('gh-repo')).toEqual(projectRepo)
  })
})
