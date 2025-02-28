import type { CollectionSlug, Config, TaskConfig, WorkflowConfig } from 'payload'

import { runJobs } from 'node_modules/payload/dist/queues/operations/runJobs/index.js'

export type SocialSchedulerConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>
  disabled?: boolean
}

export const socialScheduler =
  (pluginOptions: SocialSchedulerConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    config.collections.push({
      slug: 'social-scheduler-accounts',
      endpoints: [
        {
          handler: async (req) => {
            const id = req.query.id as string
            const payload = req.payload

            // http://localhost:3000/api/social-scheduler-accounts/instagram?code=AQAJY3kmqtQnCm0tgWX_lvvvssTBXmzJo0fHsuu-CIEoVfkuwe6NTOWIDz77DaYUwCr6Wd0NRPNjeVuvSCgLqNONtREde-gvfnU6gW_85VBgpToPYHN4d3q89meNwh50IhUBs9r0SLBOTr0NikfjqdFmhoVUOYZo9UquYAfNkWyFtUGZsxXmlVuF6ceoI8MMo3Vf7Il5NDo9qxgo9CoVcq4wCaG4VbVI5HWHnJ9pAJz3eA#_
            const code = req.query.code as string
            payload.logger.info(`Code: ${code}`)

            // Exchange Code for a Token

            // curl -X POST https://api.instagram.com/oauth/access_token \
            // -F 'client_id=990602627938098' \
            // -F 'client_secret=a1b2C3D4' \
            // -F 'grant_type=authorization_code' \
            // -F 'redirect_uri=https://my.m.redirect.net/' \
            // -F 'code=AQBx-hBsH3...'

            const client_id = process.env.INSTAGRAM_CLIENT_ID
            if (!client_id) {
              throw new Error('Missing Instagram Client ID')
            }
            const short_token = await fetch(
              `https://api.instagram.com/oauth/access_token?client_id=${client_id}&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=https://localhost:3000/api/social-scheduler-accounts/instagram`,
            )

            if (!short_token.ok) {
              payload.logger.error(`Error: ${short_token.statusText}`)
              return new Response('Error', { status: short_token.status })
            }

            const shortTokenData = (await short_token.json()) as {
              data: {
                access_token: string
                permissions: string
                user_id: string
              }[]
            }
            payload.logger.info(`Short Token Data: ${JSON.stringify(shortTokenData)}`)

            // Convert Short-Lived Access Token to Long-Lived Access Token
            // curl -i -X GET "https://graph.instagram.com/access_token
            // ?grant_type=ig_exchange_token
            // &client_secret=a1b2C3D4
            // &access_token=EAACEdEose0..."

            const client_secret = process.env.INSTAGRAM_CLIENT_SECRET
            if (!client_secret) {
              throw new Error('Missing Instagram Client Secret')
            }

            const response = await fetch(
              `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${code}`,
            )

            if (!response.ok) {
              payload.logger.error(`Error: ${response.statusText}`)
              return new Response('Error', { status: response.status })
            }

            const data = await response.json()
            payload.logger.info(`Data: ${data}`)
            const accessToken = data.access_token
            payload.logger.info(`Access Token: ${accessToken}`)

            return new Response('Hello from custom endpoint')
          },
          method: 'get',
          path: '/mastodon',
        },
        {
          handler: async (req) => {
            const id = req.query.id as string
            const payload = req.payload

            // http://localhost:3000/api/social-scheduler-accounts/instagram?code=AQAJY3kmqtQnCm0tgWX_lvvvssTBXmzJo0fHsuu-CIEoVfkuwe6NTOWIDz77DaYUwCr6Wd0NRPNjeVuvSCgLqNONtREde-gvfnU6gW_85VBgpToPYHN4d3q89meNwh50IhUBs9r0SLBOTr0NikfjqdFmhoVUOYZo9UquYAfNkWyFtUGZsxXmlVuF6ceoI8MMo3Vf7Il5NDo9qxgo9CoVcq4wCaG4VbVI5HWHnJ9pAJz3eA#_
            const code = req.query.code as string
            payload.logger.info(`Code: ${code}`)

            // Exchange Code for a Token

            // curl -X POST https://api.instagram.com/oauth/access_token \
            // -F 'client_id=990602627938098' \
            // -F 'client_secret=a1b2C3D4' \
            // -F 'grant_type=authorization_code' \
            // -F 'redirect_uri=https://my.m.redirect.net/' \
            // -F 'code=AQBx-hBsH3...'

            const client_id = process.env.INSTAGRAM_CLIENT_ID
            if (!client_id) {
              throw new Error('Missing Instagram Client ID')
            }
            const short_token = await fetch(
              `https://api.instagram.com/oauth/access_token?client_id=${client_id}&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=https://localhost:3000/api/social-scheduler-accounts/instagram`,
            )

            if (!short_token.ok) {
              payload.logger.error(`Error: ${short_token.statusText}`)
              return new Response('Error', { status: short_token.status })
            }

            const shortTokenData = (await short_token.json()) as {
              data: {
                access_token: string
                permissions: string
                user_id: string
              }[]
            }
            payload.logger.info(`Short Token Data: ${JSON.stringify(shortTokenData)}`)

            // Convert Short-Lived Access Token to Long-Lived Access Token
            // curl -i -X GET "https://graph.instagram.com/access_token
            // ?grant_type=ig_exchange_token
            // &client_secret=a1b2C3D4
            // &access_token=EAACEdEose0..."

            const client_secret = process.env.INSTAGRAM_CLIENT_SECRET
            if (!client_secret) {
              throw new Error('Missing Instagram Client Secret')
            }

            const response = await fetch(
              `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${code}`,
            )

            if (!response.ok) {
              payload.logger.error(`Error: ${response.statusText}`)
              return new Response('Error', { status: response.status })
            }

            const data = await response.json()
            payload.logger.info(`Data: ${data}`)
            const accessToken = data.access_token
            payload.logger.info(`Access Token: ${accessToken}`)

            return new Response('Hello from custom endpoint')
          },
          method: 'get',
          path: '/instagram',
        },
      ],
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            {
              label: 'Instagram',
              value: 'instagram',
            },
            {
              label: 'Mastodon',
              value: 'mastodon',
            },
          ],
        },
        {
          name: 'access',
          type: 'json',
          admin: {
            components: {
              Field: 'social-scheduler/client#InstagramLogin',
            },
          },
        },
      ],
    })

    config.collections.push({
      slug: 'plugin-collection',
      admin: {
        components: {
          beforeList: ['social-scheduler/rsc#BeforeDashboardServer'],
          edit: {
            PublishButton: 'social-scheduler/client#ScheduleButton',
          },
        },
      },
      endpoints: [
        {
          handler: async (req) => {
            const id = req.query.id as string
            const payload = req.payload
            payload.logger.info('Adding job to queue')

            // get date from request body
            if (!req.json) {
              return new Response('Missing date in request body', { status: 400 })
            }
            const body = await req.json()
            const date = new Date(body.date)

            payload.logger.info(`Date: ${date.toDateString()}`)

            const nextMinute = new Date(Date.now() + 1000 * 5)

            await payload.jobs
              .queue({
                input: {
                  id: 'IDDD',
                },
                queue: 'social-scheduler',
                task: 'createPost',
                waitUntil: nextMinute,
              })
              .then((job) => {
                payload.logger.info('Job added to queue')
              })
              .catch((error) => {
                payload.logger.error('Error adding job to queue', error)
              })
            // await payload.jobs.run({ queue: 'social-scheduler' })
            return new Response('Hello from custom endpoint')
          },
          method: 'post',
          path: '/:id/schedule',
        },
      ],
      fields: [
        {
          name: 'id',
          type: 'text',
        },
      ],
      versions: {
        drafts: {
          schedulePublish: true,
        },
      },
    })

    config.jobs?.tasks.push({
      // Configure this task to automatically retry
      // up to two times
      retries: 2,

      // This is a unique identifier for the task
      slug: 'createPost',

      // These are the arguments that your Task will accept
      inputSchema: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
      ],

      // These are the properties that the function should output
      outputSchema: [
        {
          name: 'postID',
          type: 'text',
          required: true,
        },
      ],

      // This is the function that is run when the task is invoked
      handler: ({ input, job, req }) => {
        req.payload.logger.info(`Running task: ${input?.id}`)
        console.log('input', input)
        return {
          output: {
            postID: 0,
          },
        }
      },
    } as TaskConfig<'createPost'>)

    // @ts-expect-error - This is a valid operation
    config.jobs?.autoRun?.push({
      // Every 5 minutes
      cron: '* * * * *',
      limit: 100, // limit jobs to process each run
      queue: 'social-scheduler', // name of the queue
    })

    if (pluginOptions.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          collection.fields.push({
            name: 'addedByPlugin',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
          })
        }
      }
    }

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    config.admin.components.beforeDashboard.push(`social-scheduler/client#BeforeDashboardClient`)
    config.admin.components.beforeDashboard.push(`social-scheduler/rsc#BeforeDashboardServer`)

    config.endpoints.push({
      handler: () => {
        return Response.json({ message: 'Hello from custom endpoint' })
      },
      method: 'get',
      path: '/my-plugin-endpoint',
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      const { totalDocs } = await payload.count({
        collection: 'plugin-collection',
        where: {
          id: {
            equals: 'seeded-by-plugin',
          },
        },
      })

      if (totalDocs === 0) {
        await payload.create({
          collection: 'plugin-collection',
          data: {
            id: 'seeded-by-plugin',
          },
        })
      }
    }

    return config
  }
