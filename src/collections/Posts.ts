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
				const payload = req.payload

				const id = req.routeParams?.id as string | undefined
				if (!id) {
					payload.logger.error('Missing ID')
					return new Response('Missing ID', { status: 400 })
				}
				payload.logger.info('Adding job to queue')

				// get date from request body
				if (!req.json) {
					return new Response('Missing date in request body', { status: 400 })
				}
				const body = await req.json()
				if (!body.date) {
					return new Response('Missing date in request body', { status: 400 })
				}
				console.log(body.date)
				const date = new Date(body.date)

				// Log date in german format
				payload.logger.info(`Date: ${date.toLocaleString('de-DE')}`)

				await payload.jobs
					.queue({
						input: {
							id,
						},
						queue: 'social-scheduler',
						task: 'createPost',
						waitUntil: date,
					})
					.then((job) => {
						payload.logger.info('Job added to queue')
					})
					.catch((error) => {
						payload.logger.error('Error adding job to queue', error)
					})
				await payload.jobs.run({ queue: 'social-scheduler' })
				// await payload.jobs.run({ queue: 'social-scheduler' })
				return new Response('Hello from custom endpoint')
			},
			method: 'post',
			path: '/:id/schedule',
		},
	],
	fields: [
		{
			name: 'content',
			type: 'textarea',
			admin: {
				condition: (data) => data._status === 'draft',
			},
		},
		{
			name: 'date',
			type: 'date',
			admin: {
				condition: (data) => data._status === 'draft',
				date: {
					pickerAppearance: 'dayAndTime',
					timeFormat: 'HH:mm',
					timeIntervals: 5,
				},
				position: 'sidebar',
			},
			required: true,
		},
		{
			type: 'collapsible',
			admin: {
				condition: (data) => data._status === 'draft',
			},
			fields: [
				{
					name: 'accounts',
					type: 'relationship',
					filterOptions: {
						platform: { equals: 'mastodon' },
					},
					hasMany: true,
					relationTo: 'social-scheduler-accounts',
				},
			],
			label: 'Mastodon',
		},
		{
			name: 'scheduled',
			type: 'ui',
			admin: {
				components: {
					Field: 'social-scheduler/rsc#ScheduledView',
				},
				condition: (data) =>
					data._status === 'published' && data.date && new Date(data.date) > new Date(),
			},
		},
		{
			name: 'posted',
			type: 'ui',
			admin: {
				components: {
					Field: 'social-scheduler/rsc#PostedView',
				},
				condition: (data) =>
					data._status === 'published' && data.date && new Date(data.date) <= new Date(),
			},
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
