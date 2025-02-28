import type { CollectionConfig } from 'payload'

export const MastodonApps: CollectionConfig = {
	slug: 'social-scheduler-mastodon-apps',
	admin: {
		hidden: true,
	},
	endpoints: [
		{
			handler: async (req) => {
				req.payload.logger.info(`Query: ${JSON.stringify(req.routeParams)}`)
				let rawInstanceUrl = req.routeParams?.instanceUrl
				if (!rawInstanceUrl) {
					return new Response('Missing instanceUrl', { status: 400 })
				}
				if (typeof rawInstanceUrl !== 'string') {
					return new Response('instanceUrl must be a string', { status: 400 })
				}
				// Check if the instance URL has a protocol
				if (!rawInstanceUrl.startsWith('https://')) {
					rawInstanceUrl = `https://${rawInstanceUrl}`
				}

				let instanceUrl: URL
				try {
					instanceUrl = new URL(rawInstanceUrl as string)
				} catch (error) {
					return new Response(
						`Invalid Instance URL: ${rawInstanceUrl as string} with Error: ${JSON.stringify(error)}`,
						{ status: 400 },
					)
				}

				const { payload } = req

				// Check, if a client already exists
				const existingClient = await payload.find({
					collection: 'social-scheduler-mastodon-apps',
					where: {
						instance: {
							equals: instanceUrl.hostname,
						},
					},
				})

				if (existingClient.docs.length > 0) {
					// Return the existing client
					return new Response(JSON.stringify(existingClient.docs[0]), { status: 200 })
				}

				// Create a new client
				const response = await fetch(`https://${instanceUrl.hostname}/api/v1/apps`, {
					// const response = await fetch(`https://${instanceUrl}/api/v1/apps`, {
					body: JSON.stringify({
						client_name: 'Social Scheduler',
						redirect_uris: `http://localhost:3000/api/social-scheduler-accounts/mastodon/${instanceUrl.hostname}`,
						scopes: 'read write push',
						website: 'https://social-scheduler.vercel.app',
					}),
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
				})

				if (!response.ok) {
					return new Response(response.statusText, { status: response.status })
				}

				const data = (await response.json()) as
					| {
							client_id: string
							client_secret: string
							redirect_uri: string
							vapid_key: string
					  }
					| undefined

				if (!data) {
					return new Response('Failed to create client', { status: 500 })
				}

				// Save the client
				const createdClient = await payload.create({
					collection: 'social-scheduler-mastodon-apps',
					data: {
						client_id: data.client_id,
						client_secret: data.client_secret,
						instance: instanceUrl.hostname,
						redirect_uri: data.redirect_uri,
						vapid_key: data.vapid_key,
					},
				})

				return new Response(JSON.stringify(createdClient), { status: 201 })
			},
			method: 'get',
			path: '/:instanceUrl/client',
		},
	],
	fields: [
		{
			name: 'client_id',
			type: 'text',
			required: true,
		},
		{
			name: 'client_secret',
			type: 'text',
			required: true,
		},
		{
			name: 'vapid_key',
			type: 'text',
			required: true,
		},
		{
			name: 'instance',
			type: 'text',
			required: true,
		},
		{
			name: 'redirect_uri',
			type: 'text',
			required: true,
		},
	],
}
