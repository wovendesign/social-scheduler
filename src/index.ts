import type { CollectionSlug, Config, GlobalConfig, TaskConfig, WorkflowConfig } from 'payload'

import { runJobs } from 'node_modules/payload/dist/queues/operations/runJobs/index.js'

import { Accounts } from './collections/Accounts.js'
import { MastodonApps } from './collections/MastodonApps.js'
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

		config.collections = [...config.collections, MastodonApps, Accounts, Posts]

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
