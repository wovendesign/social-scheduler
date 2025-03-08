'use client'
import type { ClientComponentProps } from 'payload'

import { Button, toast, useAllFormFields, useDocumentInfo, useForm } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'

export function ScheduleButton(props: ClientComponentProps) {
	const { id, versionCount } = useDocumentInfo()
	const { submit } = useForm()

	const [fields] = useAllFormFields()
	const formData = reduceFieldsToValues(fields, true)
	const date = formData.date

	if (versionCount > 0) {
		return (
			<Button
				onClick={() => {
					toast.promise(
						fetch(`/api/social-scheduler-posts/${id}/schedule`, {
							body: JSON.stringify({
								date,
							}),
							method: 'POST',
						}).then(() => {
							void submit({
								overrides: {
									_status: 'published',
								},
							})
						}),
						{
							error: 'Failed to schedule',
							loading: 'Scheduling...',
							success: 'Scheduled',
						},
					)
				}}
			>
				Publish Newsletter?
			</Button>
		)
	}

	return <>Save first to publish</>
}
