import type { ServerComponentProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import React from 'react'

export async function PostedView(props: ServerComponentProps) {
	const { payload } = props.req

	const mastodonPublishedPosts = await payload.find({
		collection: 'social-scheduler-mastodon-published-posts',
		where: {
			post: props.data.id,
		},
	})

	return (
		<Gutter>
			Post was released
			{mastodonPublishedPosts.totalDocs > 0 && (
				<>
					<h2>Published to Mastodon</h2>
					<ul>
						{mastodonPublishedPosts.docs.map((post) => (
							<li key={post.id}>
								<a
									href={post.mastodonUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									{post.mastodonUrl}
								</a>
							</li>
						))}
					</ul>
				</>
			)}
		</Gutter>
	)
}
