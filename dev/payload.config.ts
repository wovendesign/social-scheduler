import type { PayloadRequest } from 'payload'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, TaskConfig } from 'payload'
import sharp from 'sharp'
import { socialScheduler } from 'social-scheduler'
import { fileURLToPath } from 'url'

import { devUser } from './helpers/credentials.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
	process.env.ROOT_DIR = dirname
}

export default buildConfig({
	admin: {
		autoLogin: devUser,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [
		{
			slug: 'posts',
			fields: [
				{
					name: 'title',
					type: 'text',
					label: 'Title',
					required: true,
				},
			],
			versions: {
				drafts: {
					schedulePublish: true,
				},
				maxPerDoc: 50,
			},
		},
		{
			slug: 'media',
			fields: [],
			upload: {
				staticDir: path.resolve(dirname, 'media'),
			},
		},
	],
	db: postgresAdapter({
		// Postgres-specific arguments go here.
		// `pool` is required.
		pool: {
			connectionString: process.env.DATABASE_URI,
		},
	}),
	editor: lexicalEditor(),
	email: testEmailAdapter,
	jobs: {
		autoRun: [
			{
				cron: '*/1 * * * *',
				limit: 10,
				queue: 'default',
			},
		],
		shouldAutoRun: () => true,
		tasks: [],
	},
	onInit: async (payload) => {
		await seed(payload)
	},
	plugins: [
		socialScheduler({
			collections: {
				posts: true,
			},
		}),
	],
	secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
})
