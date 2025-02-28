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
						access: data,
						platform: 'mastodon',
					},
				})

				return new Response('Hello from custom endpoint')
			},
			method: 'get',
			path: '/mastodon/:instanceUrl',
		},
		{
			handler: async (req) => {
				const id = req.query.id as string
				const payload = req.payload

				// http://localhost:3000/api/social-scheduler-accounts/instagram?code=AQAJY3kmqtQnCm0tgWX_lvvvssTBXmzJo0fHsuu-CIEoVfkuwe6NTOWIDz77DaYUwCr6Wd0NRPNjeVuvSCgLqNONtREde-gvfnU6gW_85VBgpToPYHN4d3q89meNwh50IhUBs9r0SLBOTr0NikfjqdFmhoVUOYZo9UquYAfNkWyFtUGZsxXmlVuF6ceoI8MMo3Vf7Il5NDo9qxgo9CoVcq4wCaG4VbVI5HWHnJ9pAJz3eA#_
				const code = req.query.code as string
				payload.logger.info(`Code: ${code}`)

				// Exchange Code for a Token

				// curl -X POST https://api.instagram.com/oauth/access_token \
				// -F 'client_id=990602627938098' \
				// -F 'client_secret=a1b2C3D4' \
				// -F 'grant_type=authorization_code' \
				// -F 'redirect_uri=https://my.m.redirect.net/' \
				// -F 'code=AQBx-hBsH3...'

				const client_id = process.env.INSTAGRAM_CLIENT_ID
				if (!client_id) {
					throw new Error('Missing Instagram Client ID')
				}
				const short_token = await fetch(
					`https://api.instagram.com/oauth/access_token?client_id=${client_id}&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=https://localhost:3000/api/social-scheduler-accounts/instagram`,
				)

				if (!short_token.ok) {
					payload.logger.error(`Error: ${short_token.statusText}`)
					return new Response('Error', { status: short_token.status })
				}

				const shortTokenData = (await short_token.json()) as {
					data: {
						access_token: string
						permissions: string
						user_id: string
					}[]
				}
				payload.logger.info(`Short Token Data: ${JSON.stringify(shortTokenData)}`)

				// Convert Short-Lived Access Token to Long-Lived Access Token
				// curl -i -X GET "https://graph.instagram.com/access_token
				// ?grant_type=ig_exchange_token
				// &client_secret=a1b2C3D4
				// &access_token=EAACEdEose0..."

				const client_secret = process.env.INSTAGRAM_CLIENT_SECRET
				if (!client_secret) {
					throw new Error('Missing Instagram Client Secret')
				}

				const response = await fetch(
					`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${code}`,
				)

				if (!response.ok) {
					payload.logger.error(`Error: ${response.statusText}`)
					return new Response('Error', { status: response.status })
				}

				const data = await response.json()
				payload.logger.info(`Data: ${data}`)
				const accessToken = data.access_token
				payload.logger.info(`Access Token: ${accessToken}`)

				return new Response('Hello from custom endpoint')
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
			type: 'json',
			admin: {
				components: {
					Field: 'social-scheduler/client#InstagramLogin',
				},
			},
		},
	],
}
