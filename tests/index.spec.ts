import { expect } from 'chai'
import 'mocha'
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


describe('ar-gql tests', function () {

	it('should initialise default and other instances of arGql', async () => {
		const argql = arGql()
		expect(argql.endpointUrl, 'defaults did not load').equal('https://arweave.net/graphql')

		const testUrl = 'https://test.com/graphql'
		const testGql = arGql({ endpointUrl: testUrl })
		expect(testGql.endpointUrl, 'testUrl did not load').equal(testUrl)

		const badUrl = 'arweave.net'
		try {
			const badGql = arGql({ endpointUrl: badUrl })
			expect.fail('no error was thrown with badUrl!')
		} catch (e: any) {
			expect(e.message).eq(`string doesn't appear to be a URL of the form <http(s)://some-domain/graphql>'. You entered "${badUrl}"`)
		}
	})

	it('should execute `run` successfully', async function () {
		this.timeout(5_000)

		const argql = arGql()
		const res = await argql.run(testQuery)
		expect(res.data.transactions.edges.length).to.be.greaterThan(0)
	})

	it('should throw error in `run` with status details', async () => {
		const argql = arGql()
		const badQuery = `query($cursor: String) { transactions( tags: [ { name:`
		try {
			const res = await argql.run(badQuery)
			expect.fail('no Bad Request error was thrown')
		} catch (e: any) {
			expect(e.cause).eq(400) //this is the status numer
			expect(e.message).eq('Bad Request')
		}
	})

	const retries = 1
	const retryMs = 1_000
	it(`should throw error in 'run' after retrying connection ${retries} times`, async () => {
		const badEndpoint = 'http://localhost:1234/graphql'

		const argql = arGql({ endpointUrl: badEndpoint, retries, retryMs })
		try {
			const res = await argql.run(testQuery)
			expect.fail('no SocketError was thrown')
		} catch (e: any) {
			// console.debug(e)
			expect(e.message).eq(`Failed to fetch from ${badEndpoint} after ${retries} retries`)
		}
	}).timeout(retries * retryMs + 2_000)

	it('should execute `all` and retrieve several pages successfully', async function () {
		this.timeout(20_000)

		const argql = arGql()
		const edges = await argql.all(testQuery)
		expect(edges.length).to.be.greaterThan(0)

		const pageCallback = async (pageEdges: any[]) => {
			expect(pageEdges.length).to.be.greaterThan(0)
		}
		const edges2 = await argql.all(testQuery, undefined, pageCallback)
		expect(edges2.length).to.be.equal(0)
	})

	it('should execute `tx` successfully', async () => {
		const argql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const txMeta = await argql.tx(txid)
		expect(txMeta.id).eq(txid)
	})

	it('should execute `fetchTxTag` successfully', async () => {
		const argql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const tag = { name: 'Content-Type', value: 'text/plain' }
		const txMeta = await argql.fetchTxTag(txid, tag.name)
		expect(txMeta).eq(tag.value)
	})

})