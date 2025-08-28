import { assert, expect } from 'chai'
import 'mocha'
import { arGql, GQLUrls } from '../src/index'
import { GQLError } from '../src/faces'


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
		const gql = arGql()
		expect(gql.endpointUrl, 'defaults did not load').equal('https://arweave.net/graphql')

		const testUrl = 'https://test.com/graphql'
		const testGql = arGql({ endpointUrl: testUrl })
		expect(testGql.endpointUrl, 'testUrl did not load').equal(testUrl)
	})

	it('should execute `run` successfully', async function () {
		this.timeout(5_000)

		const gql = arGql()
		const res = await gql.run(testQuery)
		expect(res.data.transactions.edges.length).to.be.greaterThan(0)
	})

	it('should throw gql error reason', async () => {
		const gql = arGql({ endpointUrl: GQLUrls.goldsky })
		const badQuery = `query{ transactions( owners: "abcd" ){ badName } }`
		try {
			const res = await gql.run(badQuery)
			assert.fail('error should have been thrown')
		} catch (err: unknown) {
			const e = err as GQLError

			expect(e.name).eq('GQLError')
			expect(e.message).eq('Bad Request')
			expect(e.cause.status).eq(400)
			expect(e.cause.ok).eq(false)
			expect(e.cause.url).eq(GQLUrls.goldsky)
			expect(typeof e.cause.gqlError).eq('string')
		}
	})

	const retries = 1
	const retryMs = 1_000
	it(`should throw error in 'run' after retrying connection ${retries} times`, async () => {
		const badEndpoint = 'http://localhost:1234/graphql'

		const gql = arGql({ endpointUrl: badEndpoint, retries, retryMs })
		try {
			const res = await gql.run(testQuery)
			expect.fail('no SocketError was thrown')
		} catch (e: any) {
			// console.debug(e)
			expect(e.message).eq(`Failed to fetch from ${badEndpoint} after ${retries} retries`)
		}
	}).timeout(retries * retryMs + 2_000)

	it('should execute `all` and retrieve several pages successfully', async function () {
		this.timeout(20_000)

		const gql = arGql()
		const edges = await gql.all(testQuery)
		expect(edges.length).to.be.greaterThan(0)

		const pageCallback = async (pageEdges: any[]) => {
			expect(pageEdges.length).to.be.greaterThan(0)
		}
		const edges2 = await gql.all(testQuery, undefined, pageCallback)
		expect(edges2.length).to.be.equal(0)
	})

	it('should execute `tx` successfully', async () => {
		const gql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const txMeta = await gql.tx(txid)
		expect(txMeta.id).eq(txid)
	})

	it('should execute `fetchTxTag` successfully', async () => {
		const gql = arGql()
		const txid = 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'
		const tag = { name: 'Content-Type', value: 'text/plain' }
		const txMeta = await gql.fetchTxTag(txid, tag.name)
		expect(txMeta).eq(tag.value)
	})

})