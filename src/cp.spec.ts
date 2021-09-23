import 'mocha'
import exec from './cp.js'
import { expect } from 'chai'

describe('async exec', () => {

  it('should run ls', async () => {
    let out = await exec('ls')
    expect(out.length).above(0)
  })

})
