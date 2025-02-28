'use client'
import type { ClientComponentProps } from 'payload'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'

export function ScheduleButton(props: ClientComponentProps) {
	const { id, versionCount } = useDocumentInfo()

	const [fields] = useAllFormFields()
	const formData = reduceFieldsToValues(fields, true)
	const date = formData.date

	if (versionCount > 0) {
		return (
			<Button
				onClick={async () => {
					await fetch(`/api/social-scheduler-posts/${id}/schedule`, {
						body: JSON.stringify({
							date,
						}),
						method: 'POST',
					})
				}}
			>
				Publish Newsletter?
			</Button>
		)
	}

	return <>Safe first to publish</>
}
