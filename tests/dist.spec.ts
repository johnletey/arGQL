import { expect } from 'chai'
import 'mocha'
import { arGql } from '../dist'

describe('dist tests', function () {

	it('should initialise default and other instances of compiled dist', async () => {
		const argql = arGql()
		expect(argql.endpointUrl, 'defaults did not load').equal('https://arweave.net/graphql')

		const testUrl = 'https://test.com/graphql'
		const testGql = arGql({ endpointUrl: testUrl })
		expect(testGql.endpointUrl, 'testUrl did not load').equal(testUrl)
	})

})