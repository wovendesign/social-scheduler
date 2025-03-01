import type { ServerComponentProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function ScheduledView(props: ServerComponentProps) {
	return (
		<Gutter>
			<h1>
				The Post is scheduled to be released on {new Date(props.data.date).toLocaleString()}
			</h1>
		</Gutter>
	)
}
