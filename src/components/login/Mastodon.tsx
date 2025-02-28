'use client'

import type { ChangeEvent } from 'react'

import { Button, TextInput } from '@payloadcms/ui'
import { useState } from 'react'

export const MastodonLogin = () => {
	const [mastodonInstance, setMastodonInstance] = useState('')
	const [loading, setLoading] = useState(false)

	async function performLogin() {
		setLoading(true)
		const response = await fetch(`/api/mastodon-apps/${mastodonInstance}/client`)

		if (!response.ok) {
			throw new Error(response.statusText)
		}

		const client = (await response.json()) as {
			client_id: string
			client_secret: string
			id: number
			redirect_uri: string
			vapid_key: string
		}

		// Navigate to the Mastodon login page
		const url = `https://${mastodonInstance}/oauth/authorize
			?client_id=${client?.client_id}
			&scope=read+write+push
			&redirect_uri=${client?.redirect_uri}
			&response_type=code`

		window.location.href = url
	}

	return (
		<div style={{ marginTop: '2rem' }}>
			<TextInput
				AfterInput={
					<Button onClick={performLogin}>
						{loading ? 'Loading...' : 'Connect Mastodon'}
					</Button>
				}
				label="Mastodon Instance"
				onChange={(e: ChangeEvent<HTMLInputElement>) => setMastodonInstance(e.target.value)}
				path="mastodon-instance"
				value={mastodonInstance}
			/>
		</div>
	)
}
