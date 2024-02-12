export const getWsseHeader = async ({
	username,
	password,
}: { username: string; password: string }) => {
	const nonce = generateRandomString(16);
	const timestamp = new Date().toISOString();
	const digest = await base64Sha1(nonce + timestamp + password);
	return `UsernameToken Username="${username}", PasswordDigest="${digest}", Nonce="${nonce}", Created="${timestamp}"`;
};

const base64Sha1 = async (str: string) => {
	const hexDigest = await sha1(str);
	return Buffer.from(hexDigest, "hex").toString("base64");
};

const sha1 = async (text: string): Promise<string> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hash = await crypto.subtle.digest("SHA-1", data);

	return Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
};

const generateRandomString = (length = 64) => {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
};
