'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

export const InstagramLogin = () => {
	const client_id = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
	if (!client_id) {
		throw new Error('Missing Instagram Client ID')
	}

	const [mastodonInstance, setMastodonInstance] = useState('')
	const [mastodonClient, setMastodonClient] = useState<{
		client_id: string
		client_secret: string
		vapid_key: string
	}>()
	async function getMastodonApp() {
		const response = await fetch(`https://${mastodonInstance}/api/v1/apps`, {
			body: JSON.stringify({
				client_name: 'Test Application',
				redirect_uris: 'http://localhost:3000/api/social-scheduler-accounts/mastodon',
				scopes: 'read write push',
				website: 'https://myapp.example',
			}),
			method: 'POST',
		})

		console.log(response)

		if (!response.ok) {
			throw new Error(response.statusText)
		}

		const data = await response.json()
		setMastodonClient({
			client_id: data.client_id,
			client_secret: data.client_secret,
			vapid_key: data.vapid_key,
		})
	}

	return (
		<div>
			<a
				href={`https://api.instagram.com/oauth/authorize
		&client_id=${client_id}
		&redirect_uri=https://localhost:3000/api/social-scheduler-accounts/instagram
		&response_type=code
		&scope=
			instagram_business_basic%2C
			instagram_business_manage_messages%2C
			instagram_business_manage_comments%2C
			instagram_business_content_publish`}
				rel="noreferrer"
				target="_blank"
			>
				<Button>Connect Instagram</Button>
			</a>
			<div>
				<label htmlFor="mastodon-instance">Mastodon Instance</label>
				<input
					aria-label="Mastodon Instance"
					id="mastodon-instance"
					name="mastodon-instance"
					onChange={(e) => setMastodonInstance(e.target.value)}
					type="text"
					value={mastodonInstance}
				/>
				<Button
					onClick={async () => {
						await getMastodonApp()
					}}
				>
					Create Client
				</Button>
				<a
					href={`https://${mastodonInstance}/oauth/authorize
			?client_id=ZauQDuH8mf_rwsxO5qCuBLHm2921VVAscsxFdgpkHeg
			&scope=read+write+push
			&redirect_uri=http://localhost:3000/api/social-scheduler-accounts/mastodon
			&response_type=code`}
					rel="noreferrer"
					target="_blank"
				>
					<Button>Connect Mastodon</Button>
				</a>
			</div>
		</div>
	)
}
