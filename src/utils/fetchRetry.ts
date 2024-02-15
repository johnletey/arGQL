
export const fetchRetry = async (
	input: string,
	init: RequestInit,
	retry: number = 0,
) => {

	let tries = 0;
	while (true) {
		try {

			return await fetch(input, init);

		} catch (e) {
			if (tries++ < retry) {
				const timeout = 10_000
				console.warn(`waiting ${timeout}ms before retrying ${tries} of ${retry}`)
				await new Promise((resolve) => setTimeout(resolve, timeout))
				continue
			}
			throw new TypeError(`Failed to fetch from ${input} after ${retry} retries`, { cause: e })
		}
	}
}