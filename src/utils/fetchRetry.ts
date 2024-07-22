
export const fetchRetry = async (
	input: string,
	init: RequestInit,
	opts: {
		retry: number,
		retryMs: number,
	}
) => {

	const { retry, retryMs } = opts
	let tries = 0;
	while (true) {
		try {

			return await fetch(input, init);

		} catch (e) {
			if (tries++ < retry) {
				console.warn(`waiting ${retryMs}ms before retrying ${tries} of ${retry}`)
				await new Promise((resolve) => setTimeout(resolve, retryMs))
				continue
			}
			throw new TypeError(`Failed to fetch from ${input} after ${retry} retries`, { cause: e })
		}
	}
}