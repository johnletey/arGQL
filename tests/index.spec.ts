import { expect } from 'chai'
import {  } from 'mocha'
import { arGql } from '../src/index'


const testQuery = `query($cursor: String) {
  transactions(
    # your query parameters
    
		tags: [
			{ name: "App-Name", values: ["CommunityXYZ"] }
		]

    # standard template below
    after: $cursor
    first: 100
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        # what tx data you want to query for:
        
				id

      }
    }
  }
}`


describe('ar-gql tests', function(){

	it('should initialise default and other instances of arGql', async()=> {
		const argql = arGql()
		expect(argql.getConfig().endpointUrl, 'defaults did not load').equal('https://arweave.net/graphql')
		
		const testUrl = 'https://test.com/graphql'
		const testGql = arGql(testUrl)
		expect(testGql.getConfig().endpointUrl, 'testUrl did not load').equal(testUrl)

		const badUrl = 'arweave.net'
		try{
			const badGql = arGql(badUrl)
			expect(true, 'no error was thrown with badUrl').false //should not get here
		}catch(e:any){
			expect(e.message).eq(`string doesn't appear to be a URL of the form <http(s)://some-domain/graphql>'. You entered "${badUrl}"`)
		}
	})

	it('should execute `run` successfully', async function() {
		this.timeout(5_000)

		const argql = arGql()
		const res = await argql.run(testQuery) 
		expect(res.data.transactions.edges.length).to.be.greaterThan(0)
	})

	it('should execute `all` and retrieve several pages successfully', async function() {
		this.timeout(10_000)

		const argql = arGql()
		const edges = await argql.all(testQuery) 
		expect(edges.length).to.be.greaterThan(0)
	})

	it('should execute `tx` successfully', async()=> {
		const argql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const txMeta = await argql.tx(txid) 
		expect(txMeta.id).eq(txid)
	})

	it('should execute `fetchTxTag` successfully', async()=> {
		const argql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const tag = { name: 'Content-Type', value: 'text/plain'}
		const txMeta = await argql.fetchTxTag(txid, tag.name) 
		expect(txMeta).eq(tag.value)
	})


})