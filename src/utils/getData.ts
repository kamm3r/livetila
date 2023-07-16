export async function getData<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  });
  if (res.ok) {
    return await res.json();
  } else {
    throw new Error('Failed to fetch data');
  }
}
