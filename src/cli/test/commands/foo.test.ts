import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('foo', () => {
  it('runs foo cmd', async () => {
    const {stdout} = await runCommand('foo')
    expect(stdout).to.contain('hello world')
  })

  it('runs foo --name oclif', async () => {
    const {stdout} = await runCommand('foo --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
