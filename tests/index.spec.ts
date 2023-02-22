import { expect } from 'chai'
import {  } from 'mocha'
import { arGql } from '../src/index'

describe('ar-gql tests', function(){

	it('should initialise default and other instances of arGql', async()=> {
		const argql = arGql()
		expect(argql.getConfig().endpointUrl, 'defaults did not load').equal('https://arweave.net/graphql')
		
		const testUrl = 'https://test.com/graphql'
		const testGql = arGql(testUrl)
		expect(testGql.getConfig().endpointUrl, 'testUrl did not load').equal(testUrl)

		const badUrl = 'arweave.net'
		try{
			arGql(badUrl)
			expect(true, 'no error was thrown with badUrl').false //should not get here
		}catch(e:any){
			expect(e.message).eq(`string doesn't appear to be a URL of the form <http(s)://some-domain/graphql>'. You entered "${badUrl}"`)
		}
	})

	// it('should execute `run` successfully', async()=> {
	// 	const res = await 
	// })

})