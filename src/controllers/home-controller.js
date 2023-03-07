import axios from 'axios'

/**
 * Home controller.
 */
export class HomeController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  index (req, res, next) {
    res.render('home/index')
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  redirectToGitlab (req, res, next) {
    res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APPLICATION_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${process.env.STATE}&scope=read_api+read_user+read_repository`)
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async successAuthorization (req, res, next) {
    const code = req.query.code
    const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`

    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)

    req.session.refreshToken = response.data.refresh_token
    // console.log('REFRESH TOKEN -------------------------------', req.session.refreshToken)
    res.render('auth/welcome')
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async profile (req, res, next) {
    // console.log('REFRESH TOKEN -------------------------------', req.session.refreshToken)
    const refreshToken = req.session.refreshToken

    const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token&redirect_uri=${process.env.REDIRECT_URI}`

    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)
    const accessToken = response.data.access_token
    console.log('RESPONSE FROM PROFILE ------------------------------------------', accessToken)

    const { data } = await axios.get(`https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`)

    // console.log('The user data ------------------------ ', data)

    req.session.accessToken = accessToken
    res.render('auth/profile', { data })
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async events (req, res, next) {
    const accessToken = req.session.accessToken
    const perPage = 70
    let page = 1
    let events = []

    for (let i = 0; i < 2; i++) {
      const response = await axios.get(`https://gitlab.lnu.se/api/v4/events?&per_page=${perPage}&page=${page}&access_token=${accessToken}`)

      events = events.concat(response.data)

      page++
    }

    res.render('auth/events', { events })
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async groups (req, res, next) {
    const accessToken = req.session.accessToken
    console.log('ACCESSTOKEN FROM GROUPS ------------------------ ', accessToken)

    // const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token&redirect_uri=${process.env.REDIRECT_URI}`

    // const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)
    // const accessToken = response.data.access_token
    // console.log('The ACCESSTOKEN ------------------------ ', accessToken)

    // const { data } = await axios.get(`https://gitlab.lnu.se/api/v4/groups?access_token=${accessToken}`)

    const query = `
        query {
          currentUser {
            groups(first: 3) {
            nodes {
              name
              fullPath
              webUrl
              avatarUrl
              projects(first: 5) {
              nodes {
                name
                fullPath
                webUrl
              }
            }
          }
        }
      }
    }
    `

    // const queryTwo = `
    // query {
    //   currentUser {
    //     groups {
    //     nodes {
    //       name
    //       fullPath
    //       avatarUrl
    //       projects {
    //       nodes {
    //         name
    //         fullPath
    //         repository {
    //           tree {
    //             lastCommit {
    //               authorName
    //               authoredDate
    //             }
    //           }
    //         }
    //       }
    //       }
    //     }
    //     }
    //   }
    // }`

    const url = 'https://gitlab.lnu.se/api/graphql'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
    const data = JSON.stringify({ query })

    const response = await axios.post(url, data, { headers })

    // console.log('GRAPHQL RESPONSE--------------------------------------------------------', response.data)

    const groups = response.data.data.currentUser.groups.nodes

    // groups.forEach(group => {
    //   console.log('EACH GROUP GRAPHQL RESPONSE ------------------------------------------------------------- ')
    //   console.log('Group name: ', group.name)
    //   console.log('Group avatarUrl: ', group.avatarUrl)
    //   console.log('Group path: ', group.fullPath)
    //   console.log('Group projects: ', group.projects.nodes)
    // })

    res.render('auth/groups', { groups })
  }
}
