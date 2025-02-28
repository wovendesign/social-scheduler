import type { ServerComponentProps } from 'payload'

import styles from './ConnectedAccounts.module.css'

export const Instagram = async (props: ServerComponentProps) => {
	const { payload } = props

	const { docs } = await payload.find({
		collection: 'social-scheduler-accounts',
		where: {
			platform: {
				equals: 'instagram',
			},
		},
	})

	// const upcomingJobs = payload.jobs.queue()

	// payload.logger.info('Upcoming jobs:')
	// payload.logger.info(upcomingJobs)

	const accounts = await Promise.all(
		docs.map(async (doc) => {
			const searchParams = new URLSearchParams({
				access_token: doc.access,
				fields: 'username,profile_picture_url',
			})

			const userReq = await fetch(
				`https://graph.instagram.com/v22.0/me?${searchParams.toString()}`,
			)
			const user = (await userReq.json()) as {
				profile_picture_url?: string
				username: string
			}

			return {
				...(doc as { id: string; instanceUrl: string }),
				user,
			}
		}),
	)

	return (
		<div className={styles.wrapper}>
			{accounts.map((account) => (
				<div className={styles.account} key={account.id}>
					<img
						alt={account.user.username}
						src={account.user.profile_picture_url || 'https://placehold.co/400x400'}
					/>
					<div>{account.user.username}</div>
				</div>
			))}
		</div>
	)
}
