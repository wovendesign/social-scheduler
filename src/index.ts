import type { CollectionSlug, Config, GlobalConfig, TaskConfig, WorkflowConfig } from 'payload'

import { runJobs } from 'node_modules/payload/dist/queues/operations/runJobs/index.js'

import { Accounts } from './collections/Accounts.js'
import { MastodonApps } from './collections/MastodonApps.js'

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

		const settings = {
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
							fields: [],
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
		} satisfies GlobalConfig

		if (!config.globals) {
			config.globals = [settings]
		} else {
			config.globals.push(settings)
		}

		config.collections = [...config.collections, MastodonApps, Accounts]

		config.collections.push({
			slug: 'plugin-collection',
			admin: {
				components: {
					beforeList: ['social-scheduler/rsc#BeforeDashboardServer'],
					edit: {
						PublishButton: 'social-scheduler/client#ScheduleButton',
					},
				},
			},
			endpoints: [
				{
					handler: async (req) => {
						const id = req.query.id as string
						const payload = req.payload
						payload.logger.info('Adding job to queue')

						// get date from request body
						if (!req.json) {
							return new Response('Missing date in request body', { status: 400 })
						}
						const body = await req.json()
						const date = new Date(body.date)

						payload.logger.info(`Date: ${date.toDateString()}`)

						const nextMinute = new Date(Date.now() + 1000 * 5)

						await payload.jobs
							.queue({
								input: {
									id: 'IDDD',
								},
								queue: 'social-scheduler',
								task: 'createPost',
								waitUntil: nextMinute,
							})
							.then((job) => {
								payload.logger.info('Job added to queue')
							})
							.catch((error) => {
								payload.logger.error('Error adding job to queue', error)
							})
						// await payload.jobs.run({ queue: 'social-scheduler' })
						return new Response('Hello from custom endpoint')
					},
					method: 'post',
					path: '/:id/schedule',
				},
			],
			fields: [
				{
					name: 'id',
					type: 'text',
				},
			],
			versions: {
				drafts: {
					schedulePublish: true,
				},
			},
		})

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
			handler: ({ input, job, req }) => {
				req.payload.logger.info(`Running task: ${input?.id}`)
				console.log('input', input)
				return {
					output: {
						postID: 0,
					},
				}
			},
		} as TaskConfig<'createPost'>)

		// @ts-expect-error - This is a valid operation
		config.jobs?.autoRun?.push({
			// Every 5 minutes
			cron: '* * * * *',
			limit: 100, // limit jobs to process each run
			queue: 'social-scheduler', // name of the queue
		})

		if (pluginOptions.collections) {
			for (const collectionSlug in pluginOptions.collections) {
				const collection = config.collections.find(
					(collection) => collection.slug === collectionSlug,
				)

				if (collection) {
					collection.fields.push({
						name: 'addedByPlugin',
						type: 'text',
						admin: {
							position: 'sidebar',
						},
					})
				}
			}
		}

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

		config.admin.components.beforeDashboard.push(
			`social-scheduler/client#BeforeDashboardClient`,
		)
		config.admin.components.beforeDashboard.push(`social-scheduler/rsc#BeforeDashboardServer`)

		config.endpoints.push({
			handler: () => {
				return Response.json({ message: 'Hello from custom endpoint' })
			},
			method: 'get',
			path: '/my-plugin-endpoint',
		})

		const incomingOnInit = config.onInit

		config.onInit = async (payload) => {
			// Ensure we are executing any existing onInit functions before running our own.
			if (incomingOnInit) {
				await incomingOnInit(payload)
			}

			const { totalDocs } = await payload.count({
				collection: 'plugin-collection',
				where: {
					id: {
						equals: 'seeded-by-plugin',
					},
				},
			})

			if (totalDocs === 0) {
				await payload.create({
					collection: 'plugin-collection',
					data: {
						id: 'seeded-by-plugin',
					},
				})
			}
		}

		return config
	}
