import type { ServerComponentProps } from 'payload'

import styles from './ConnectedAccounts.module.css'

export const Mastodon = async (props: ServerComponentProps) => {
	const { payload } = props

	const { docs } = await payload.find({
		collection: 'social-scheduler-accounts',
		where: {
			platform: {
				equals: 'mastodon',
			},
		},
	})

	// const upcomingJobs = payload.jobs.queue()

	// payload.logger.info('Upcoming jobs:')
	// payload.logger.info(upcomingJobs)

	const accounts = await Promise.all(
		docs.map(async (doc) => {
			const userReq = await fetch(
				`https://${doc.instanceUrl}/api/v1/accounts/verify_credentials`,
				{
					headers: {
						Authorization: `Bearer ${doc.access}`,
					},
				},
			)
			const user = (await userReq.json()) as {
				avatar: string
				display_name: string
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
					<img alt={account.user.display_name} src={account.user.avatar} />
					<div>
						{account.user.display_name}
						<span>{account.instanceUrl}</span>
					</div>
				</div>
			))}
		</div>
	)
}
