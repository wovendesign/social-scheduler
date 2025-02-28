import type { GlobalConfig } from 'payload'

export const settings: GlobalConfig = {
	slug: 'social-scheduler-settings',
	admin: {
		group: 'Social Scheduler',
	},
	fields: [
		{
			name: 'instagram',
			type: 'group',
			fields: [
				{
					name: 'clientId',
					type: 'text',
					label: 'Client ID',
				},
				{
					name: 'clientSecret',
					type: 'text',
					label: 'Client Secret',
				},
				{
					type: 'collapsible',
					fields: [
						{
							name: 'instagram-login',
							type: 'ui',
							admin: {
								components: {
									Field: 'social-scheduler/client#InstagramLogin',
								},
							},
						},
					],
					label: 'Connected Instagram Accounts',
				},
			],
		},
		{
			name: 'mastodon',
			type: 'group',
			fields: [
				{
					type: 'collapsible',
					fields: [
						{
							name: 'connectedAccounts',
							type: 'ui',
							admin: {
								components: {
									Field: 'social-scheduler/rsc#Mastodon',
								},
							},
						},
						{
							name: 'mastodon-login',
							type: 'ui',
							admin: {
								components: {
									Field: 'social-scheduler/client#MastodonLogin',
								},
							},
						},
					],
					label: 'Connected Mastodon Accounts',
				},
			],
		},
	],
}
