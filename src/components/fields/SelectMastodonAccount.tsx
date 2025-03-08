'use client'
import type { RelationshipFieldClientComponent } from 'payload'
import type { MastodonAccount } from 'src/collections/Accounts.js'

import { CheckboxInput, useField, usePayloadAPI } from '@payloadcms/ui'
import React, { useEffect } from 'react'

import styles from '../ConnectedAccounts/ConnectedAccounts.module.css'

export const SelectMastodonAccount: RelationshipFieldClientComponent = (props) => {
	const [{ data, isError, isLoading }] = usePayloadAPI(
		'/api/social-scheduler-accounts/getAccounts/mastodon',
		{ initialParams: { depth: 1 } },
	)

	const { setValue, value } = useField({ path: props.path })

	return (
		<div>
			{isError && <div>Error loading accounts</div>}
			{isLoading && <div>Loading...</div>}
			{data &&
				data.length > 0 &&
<<<<<<< HEAD
				data.map((account: MastodonAccount) => {
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
							<img alt={account.user.display_name} src={account.user.avatar} />
							<div>
								{account.user.display_name}
								<span>{account.instanceUrl}</span>
							</div>
						</label>
					)
				})}
=======
				data.map(
					(account: {
						id: string
						instanceUrl: string
						user: {
							avatar: string
							display_name: string
						}
					}) => {
						return (
							<label
								className={styles.account}
								htmlFor={`select-account-${account.id}`}
								key={account.id}
							>
								<CheckboxInput
									checked={Array.isArray(value) && value.includes(account.id)}
									id={`select-account-${account.id}`}
									onToggle={(e) => {
										if (e.target.checked) {
											// setSelected([...selected, account.id])
											setValue([
												...((Array.isArray(value) && value) || []),
												account.id,
											])
										} else {
											// setSelected(selected.filter((id) => id !== account.id))
											setValue(
												((Array.isArray(value) && value) || []).filter(
													(id) => id !== account.id,
												),
											)
										}
									}}
								/>
								<img alt={account.user.display_name} src={account.user.avatar} />
								<div>
									{account.user.display_name}
									<span>{account.instanceUrl}</span>
								</div>
							</label>
						)
					},
				)}
>>>>>>> 0225870cba54145d4404aedc8c9430e0f0d55d69
		</div>
	)
}
