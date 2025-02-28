import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
	slug: 'social-scheduler-posts',
	admin: {
		components: {
			edit: {
				PublishButton: 'social-scheduler/client#ScheduleButton',
			},
		},
		group: 'Social Scheduler',
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
	labels: {
		plural: 'Posts',
		singular: 'Post',
	},
	versions: {
		drafts: {
			schedulePublish: true,
		},
	},
}
