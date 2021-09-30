import { expect } from "chai"
import { StreamToJSON } from "./watcher.js"

describe('stream to json', () => {
  it('should generate proper JSON when stream is valid JSON', function () {
    let received = false
    let converter = new StreamToJSON().addListener('json', json => {
      expect(typeof json).to.be.equal('object')
      received = true
    })

    converter.dataReceived('{\n')
    converter.dataReceived(`"name`)
    converter.dataReceived(`":"hello`)
    converter.dataReceived(`"\n}`)

    expect(received).to.be.true
  })
})
