import type { CollectionConfig } from 'payload'

export const Images: CollectionConfig = {
	slug: 'social-scheduler-images',
	fields: [
		{
			name: 'alt',
			type: 'text',
		},
	],
	upload: {
		imageSizes: [
			{
				name: 'instagram',
				formatOptions: {
					format: 'jpeg',
					options: {
						quality: 100,
					},
				},
				height: 1350,
				position: 'centre',
				width: 1080,
			},
			{
				name: 'square',
				height: 1080,
				position: 'centre',
				width: 1080,
			},
			{
				name: 'story',
				height: 1920,
				position: 'centre',
				width: 1080,
			},
		],
		mimeTypes: ['image/*'],
		staticDir: 'social-scheduler-images',
	},
}
