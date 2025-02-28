'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

export const MastodonLogin = () => {
	const [mastodonInstance, setMastodonInstance] = useState('')
	const [mastodonClient, setMastodonClient] = useState<{
		client_id: string
		client_secret: string
		id: number
		redirect_uri: string
		vapid_key: string
	}>()
	async function getMastodonApp() {
		const response = await fetch(`/api/mastodon-apps/${mastodonInstance}/client`)

		if (!response.ok) {
			throw new Error(response.statusText)
		}

		const data = await response.json()
		console.log(data)
		setMastodonClient({
			id: data.id,
			client_id: data.client_id,
			client_secret: data.client_secret,
			redirect_uri: data.redirect_uri,
			vapid_key: data.vapid_key,
		})
	}

	return (
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
			?client_id=${mastodonClient?.client_id}
			&scope=read+write+push
			&redirect_uri=${mastodonClient?.redirect_uri}
			&response_type=code`}
				rel="noreferrer"
				target="_blank"
			>
				<Button>Connect Mastodon</Button>
			</a>
		</div>
	)
}
