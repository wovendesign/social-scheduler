'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

export const InstagramLogin = () => {
	const client_id = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
	if (!client_id) {
		throw new Error('Missing Instagram Client ID')
	}

	return (
		<div>
			<a
				href={`https://api.instagram.com/oauth/authorize
					?client_id=${client_id}
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
		</div>
	)
}
