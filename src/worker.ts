/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;

	// Example binding to a Secret. Learn more at https://developers.cloudflare.com/workers/runtime-apis/secrets/
	SECRET_TOKEN: string;
	DISCORD_WEBHOOK_URL: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		if (request.headers.get('authorization') != `Shared ${env.SECRET_TOKEN}`) {
			return new Response('Unauthorized', { status: 401 });
		}

		const { tweet }: { tweet: string } = await request.json();

		const response = await fetch(env.DISCORD_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				content: tweet.replace('//twitter.com', '//vxtwitter.com'),
			}),
		});

		if (response.ok) {
			return new Response('OK');
		}

		console.error('RELAY FAILED');
		console.error(await response.text());
		return new Response('Internal Server Error', { status: 500 });
	},
};
