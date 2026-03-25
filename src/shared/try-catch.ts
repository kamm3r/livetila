// Types for the result object with discriminated union
type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function with improved type safety
export async function tryCatch<T, E = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (rawError) {
		// Ensure error is always an Error instance for better type safety
		const error =
			rawError instanceof Error
				? (rawError as E)
				: (new Error(String(rawError)) as E);
		return { data: null, error };
	}
}
