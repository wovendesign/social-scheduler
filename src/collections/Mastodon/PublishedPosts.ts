import type { CollectionConfig } from 'payload'

export const MastodonPublishedPosts: CollectionConfig = {
	slug: 'social-scheduler-mastodon-published-posts',
	admin: {
		hidden: true,
	},
	fields: [
		{
			name: 'post',
			type: 'relationship',
			label: 'Post ID',
			relationTo: 'social-scheduler-posts',
			required: true,
		},
		{
			name: 'account',
			type: 'relationship',
			label: 'Account',
			relationTo: 'social-scheduler-accounts',
			required: true,
		},
		{
			name: 'publishedAt',
			type: 'text',
			label: 'Published At',
			required: true,
		},
		{
			name: 'mastodonId',
			type: 'text',
			label: 'Mastodon ID',
			required: true,
		},
		{
			name: 'mastodonUrl',
			type: 'text',
			label: 'Mastodon URL',
			required: true,
		},
	],
}
