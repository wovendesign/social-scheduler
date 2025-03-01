import type { CollectionSlug, Config, TaskConfig } from 'payload'

import { Accounts } from './collections/Accounts.js'
import { MastodonApps } from './collections/Mastodon/Apps.js'
import { MastodonPublishedPosts } from './collections/Mastodon/PublishedPosts.js'
import { Posts } from './collections/Posts.js'
import { settings } from './globals/Settings.js'

export type SocialSchedulerConfig = {
	/**
	 * List of collections to add a custom field
	 */
	collections?: Partial<Record<CollectionSlug, true>>
	disabled?: boolean
}

export const socialScheduler =
	(pluginOptions: SocialSchedulerConfig) =>
	(config: Config): Config => {
		if (!config.collections) {
			config.collections = []
		}

		if (!config.globals) {
			config.globals = [settings]
		} else {
			config.globals.push(settings)
		}

		config.collections = [
			...config.collections,
			MastodonApps,
			Accounts,
			Posts,
			MastodonPublishedPosts,
		]

		config.jobs?.tasks.push({
			// Configure this task to automatically retry
			// up to two times
			retries: 2,

			// This is a unique identifier for the task
			slug: 'createPost',

			// These are the arguments that your Task will accept
			inputSchema: [
				{
					name: 'id',
					type: 'text',
					required: true,
				},
			],

			// These are the properties that the function should output
			outputSchema: [
				{
					name: 'postID',
					type: 'text',
					required: true,
				},
			],

			// This is the function that is run when the task is invoked
			handler: async ({ input, req }) => {
				const { payload } = req

				const id = input?.id
				if (!id) {
					throw new Error('Missing ID')
				}

				const post = await payload.findByID({
					id,
					collection: 'social-scheduler-posts',
					depth: 2,
					draft: true,
				})
				if (!post) {
					throw new Error('Post not found')
				}

				const { accounts, content } = post

				for (const account of accounts) {
					if (account.platform === 'mastodon') {
						payload.logger.info(
							`Posting to Mastodon: ${account.instanceUrl} with content ${content}`,
						)

						const formData = new FormData()
						formData.append('status', content)

						await fetch(`https://${account.instanceUrl}/api/v1/statuses`, {
							body: formData,
							headers: {
								Authorization: `Bearer ${account.access}`,
							},
							method: 'POST',
						})
							.then(async (res) => {
								if (!res.ok) {
									payload.logger.error(`Error: ${res.statusText}`)
									const data = await res.json()
									payload.logger.error(`Data: ${JSON.stringify(data)}`)
									throw new Error('Error posting to Mastodon')
								}
								const data = await res.json()
								payload.logger.info(`Data: ${JSON.stringify(data)}`)

								payload.logger.info(`Saving published post with ID: ${id}`)

								await payload
									.create({
										collection: 'social-scheduler-mastodon-published-posts',
										data: {
											account: account.id,
											mastodonId: data.id,
											mastodonUrl: data.url,
											post: parseInt(id),
											publishedAt: data.created_at,
										},
									})
									.catch((error) => {
										payload.logger.error(
											`Error saving published post: ${JSON.stringify(error)}`,
										)
									})

								return data
							})
							.catch((error) => {
								payload.logger.error(`Error posting to Mastodon ${error}`)
							})

						continue
					}

					payload.logger.info('Unsupported account type')
				}

				return {
					output: {
						postID: 0,
					},
				}
			},
		} as TaskConfig<'createPost'>)

		// @ts-expect-error - This is a valid operation
		config.jobs?.autoRun?.push({
			cron: '*/1 * * * *',
			limit: 100, // limit jobs to process each run
			queue: 'social-scheduler', // name of the queue
		})

		/**
		 * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
		 * If your plugin heavily modifies the database schema, you may want to remove this property.
		 */
		if (pluginOptions.disabled) {
			return config
		}

		if (!config.endpoints) {
			config.endpoints = []
		}

		if (!config.admin) {
			config.admin = {}
		}

		if (!config.admin.components) {
			config.admin.components = {}
		}

		if (!config.admin.components.beforeDashboard) {
			config.admin.components.beforeDashboard = []
		}

		const incomingOnInit = config.onInit

		config.onInit = async (payload) => {
			// Ensure we are executing any existing onInit functions before running our own.
			if (incomingOnInit) {
				await incomingOnInit(payload)
			}
		}

		return config
	}
