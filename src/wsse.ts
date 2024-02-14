export async function getWsseHeader({
	username,
	password,
}: { username: string; password: string }) {
	if (!username || !password) {
		throw new Error("Username and API key are required");
	}

	const nonce = generateNonce();
	const now = new Date().toISOString();
	const digest = await sha1(nonce + now + password);
	const encodedDigest = btoa(String.fromCharCode(...new Uint8Array(digest)));
	const encodedNonce = btoa(nonce);

	const credentials = `UsernameToken Username="${username}", PasswordDigest="${encodedDigest}", Nonce="${encodedNonce}", Created="${now}"`;

	return credentials;
}

function generateNonce() {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return array.join("");
}

async function sha1(data: string) {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-1", dataBuffer);
	return hashBuffer;
}
