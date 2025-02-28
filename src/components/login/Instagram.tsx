'use client'

import { Button, useAllFormFields } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'

export const InstagramLogin = () => {
	const [fields] = useAllFormFields()
	const formData = reduceFieldsToValues(fields, true)
	const client_id = formData.instagram?.clientId

	return (
		<div>
			{client_id ? (
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
			) : (
				<p>
					You need to create a{' '}
					<a
						href="https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/create-a-meta-app-with-instagram"
						rel="noreferrer noopener"
						target="_blank"
					>
						Meta App for Instagram
					</a>{' '}
					and add the Client ID and Client Secret to the settings
				</p>
			)}
		</div>
	)
}
