'use client'
import type { RelationshipFieldClientComponent } from 'payload'
import type { InstagramAccount } from 'src/collections/Accounts.js'

import { CheckboxInput, useField, usePayloadAPI } from '@payloadcms/ui'
import React, { useEffect } from 'react'

import styles from '../ConnectedAccounts/ConnectedAccounts.module.css'

export const SelectInstagramAccount: RelationshipFieldClientComponent = (props) => {
	const [{ data, isError, isLoading }] = usePayloadAPI(
		'/api/social-scheduler-accounts/getAccounts/instagram',
		{ initialParams: { depth: 1 } },
	)

	const [selected, setSelected] = React.useState<string[]>([])

	const { setValue, value } = useField({ path: props.path })
	useEffect(() => {
		setValue(selected)
	}, [selected, setValue])

	useEffect(() => {
		if (value) {
			if (Array.isArray(value)) {
				setSelected(value)
			}
		}
	}, [value])

	return (
		<div>
			{isError && <div>Error loading accounts</div>}
			{isLoading && <div>Loading...</div>}
			{data &&
				data.length > 0 &&
				data.map((account: InstagramAccount) => {
					return (
						<label
							className={styles.account}
							htmlFor={`select-account-${account.id}`}
							key={account.id}
						>
							<CheckboxInput
								checked={selected.includes(account.id)}
								id={`select-account-${account.id}`}
								onToggle={(e) => {
									if (e.target.checked) {
										setSelected([...selected, account.id])
									} else {
										setSelected(selected.filter((id) => id !== account.id))
									}
								}}
							/>
							<img
								alt={account.user.username}
								src={account.user.profile_picture_url}
							/>
							<div>{account.user.username}</div>
						</label>
					)
				})}
		</div>
	)
}
