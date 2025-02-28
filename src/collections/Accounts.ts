import type { CollectionConfig } from 'payload'

export const Accounts: CollectionConfig = {
	slug: 'social-scheduler-accounts',
	endpoints: [
		{
			handler: async (req) => {
				const payload = req.payload

				const code = req.query.code as string
				payload.logger.info(`Code: ${code}`)

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

				payload.logger.info(`Instance URL: ${instanceUrl}`)

				const clientReq = await payload.find({
					collection: 'mastodon-apps',
					where: {
						instance: {
							equals: instanceUrl.hostname,
						},
					},
				})

				if (clientReq.docs.length === 0) {
					return new Response('Client not found', { status: 404 })
				}

				const client = clientReq.docs[0]
				payload.logger.info(`Client: ${JSON.stringify(client)}`)

				// Get User Bearer
				const formData = new FormData()
				formData.append('client_id', client.client_id)
				formData.append('client_secret', client.client_secret)
				formData.append('code', code)
				formData.append('grant_type', 'authorization_code')
				formData.append('redirect_uri', client.redirect_uri)
				formData.append('scope', 'read write follow')

				payload.logger.info(`Body: ${JSON.stringify(formData)}`)

				const res = await fetch(`https://${instanceUrl.hostname}/oauth/token`, {
					body: formData,
					method: 'POST',
				})

				if (!res.ok) {
					payload.logger.error(`Error: ${res.statusText}`)
					const data = await res.json()
					payload.logger.error(`Data: ${JSON.stringify(data)}`)
					return new Response('Error', { status: res.status })
				}

				const data = (await res.json()) as
					| {
							access_token: string
							created_at: number
							scope: string
							token_type: string
					  }
					| undefined

				payload.logger.info(`Data: ${JSON.stringify(data)}`)

				await payload.create({
					collection: 'social-scheduler-accounts',
					data: {
						access: data?.access_token,
						instanceUrl: instanceUrl.hostname,
						platform: 'mastodon',
					},
				})

				// Redirect to the dashboard
				const resp = new Response('Redirecting', { status: 302 })
				resp.headers.set(
					'Location',
					'http://localhost:3000/admin/globals/social-scheduler-settings',
				)
				return resp
			},
			method: 'get',
			path: '/mastodon/:instanceUrl',
		},
		{
			handler: async (req) => {
				const id = req.query.id as string
				const payload = req.payload

				// http://localhost:3000/api/social-scheduler-accounts/instagram?code=AQDPxi1eb9zKnTqYE9XpaHcT6yOrl4Hm213zUN3a7OtvgcVNY03EHnjpl25ga1FgRjcGMsZB0INiYlVhCSIcaegWdouT72UayJv_mPImxgfN59UHDemVX1RvvKn5EFLPPkL4dFghhvQWAv6-GNMlTsijhrIjAvnE4FNuu2u1D00oASwpErnOQKVUACMB6vdRFsXr66fFj0TcbwQfXgrSLmGf0jZUTSvZTrt2C-j4lXCWYA#_
				const code = req.query.code as string
				payload.logger.info(`Code: ${code}`)

				const socialSchedulerSettings = await payload.findGlobal({
					slug: 'social-scheduler-settings',
				})

				const client_id = socialSchedulerSettings?.instagram?.clientId
				if (!client_id) {
					throw new Error('Missing Instagram Client ID')
				}

				const client_secret = socialSchedulerSettings?.instagram?.clientSecret
				if (!client_secret) {
					throw new Error('Missing Instagram Client Secret')
				}

				const formData = new FormData()
				formData.append('client_id', client_id)
				formData.append('client_secret', client_secret)
				formData.append('grant_type', 'authorization_code')
				formData.append(
					'redirect_uri',
					'https://localhost:3000/api/social-scheduler-accounts/instagram',
				)
				formData.append('code', code)

				const short_token = await fetch(`https://api.instagram.com/oauth/access_token`, {
					body: formData,
					method: 'POST',
				})

				if (!short_token.ok) {
					payload.logger.error(`Error: ${short_token.statusText}`)
					return new Response('Error', { status: short_token.status })
				}

				const shortTokenData = (await short_token.json()) as {
					access_token: string
					permissions: string
					user_id: string
				}
				payload.logger.info(`Short Token Data: ${JSON.stringify(shortTokenData)}`)

				// Convert Short-Lived Access Token to Long-Lived Access Token

				const response = await fetch(
					`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${shortTokenData.access_token}`,
				)

				if (!response.ok) {
					payload.logger.error(`Error: ${response.statusText}`)
					payload.logger.error(`Data: ${JSON.stringify(await response.text())}`)
					return new Response('Error', { status: response.status })
				}

				const data = await response.json()
				payload.logger.info(`Data: ${data}`)
				const accessToken = data.access_token
				payload.logger.info(`Access Token: ${accessToken}`)

				await payload.create({
					collection: 'social-scheduler-accounts',
					data: {
						access: data?.access_token,
						platform: 'instagram',
					},
				})

				// Redirect to the dashboard
				const resp = new Response('Redirecting', { status: 302 })
				resp.headers.set(
					'Location',
					'http://localhost:3000/admin/globals/social-scheduler-settings',
				)
				return resp
			},
			method: 'get',
			path: '/instagram',
		},
	],
	fields: [
		{
			name: 'platform',
			type: 'select',
			options: [
				{
					label: 'Instagram',
					value: 'instagram',
				},
				{
					label: 'Mastodon',
					value: 'mastodon',
				},
			],
		},
		{
			name: 'access',
			type: 'text',
			admin: {
				components: {
					Field: 'social-scheduler/client#InstagramLogin',
				},
			},
			unique: true,
		},
		{
			name: 'instanceUrl',
			type: 'text',
		},
	],
}
