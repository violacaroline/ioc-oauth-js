import axios from 'axios'
import fetch from 'node-fetch'
import { HomeService } from '../service/home-service.js'

/**
 * Home controller.
 */
export class HomeController {
  #service

  /**
   * Hkahssöfkjhsd.
   *
   * @param {HomeService} service - lkshdfoihsdg
   */
  constructor (service = new HomeService()) {
    this.#service = service
  }

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
  async logIn (req, res, next) {
    const code = req.query.code
    const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`

    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)

    // req.session.user = response
    req.session.accessToken = response.data.access_token
    res.render('auth/welcome')
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getProfile (req, res, next) {
    const accessToken = req.session.accessToken

    // GET REFRESHTOKEN???
    // const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token&redirect_uri=${process.env.REDIRECT_URI}`
    // const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)

    const { data } = await axios.get(`${process.env.GITLAB_REST_API}/user?access_token=${accessToken}`)

    res.render('user/profile', { data })
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getEvents (req, res, next) {
    const accessToken = req.session.accessToken
    // const perPage = 70
    // let page = 1
    // let events = []

    // for (let i = 0; i < 2; i++) {
    //   const response = await axios.get(`${process.env.GITLAB_REST_API}/events?&per_page=${perPage}&page=${page}&access_token=${accessToken}`)

    //   events = events.concat(response.data)

    //   page++
    // }
    const events = await this.#service.getEvents(accessToken)

    res.render('user/events', { events })
  }

  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getGroupsAndProjects (req, res, next) {
    const accessToken = req.session.accessToken
    console.log('ACCESSTOKEN FROM GROUPS ------------------------ ', accessToken)

    const query = `
    query {
      currentUser {
        groups(first: 3) {
          pageInfo {
            hasNextPage
          }
          nodes {
            name
            webUrl
            avatarUrl
            fullPath
            projects(first: 5, includeSubgroups: true) {
              pageInfo {
                hasNextPage
              }
              nodes {
                name
                webUrl
                avatarUrl
                fullPath
                repository {
                  tree {
                    lastCommit {
                      authoredDate
                      author {
                        name
                        avatarUrl
                        username
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }

    const response = await fetch(process.env.GITLAB_GRAPHQL_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    const result = await response.json()

    const groups = result.data.currentUser.groups

    res.render('user/groups', { groups })
  }
}
