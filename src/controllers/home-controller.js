import axios from 'axios'
import fetch from 'node-fetch'

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

    req.session.accessToken = response.data.access_token
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
  async getProfile (req, res, next) {
    // console.log('REFRESH TOKEN -------------------------------', req.session.refreshToken)
    const accessToken = req.session.accessToken

    // const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token&redirect_uri=${process.env.REDIRECT_URI}`

    // const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)
    // const accessToken = response.data.access_token
    // console.log('RESPONSE FROM PROFILE ------------------------------------------', accessToken)

    const { data } = await axios.get(`${process.env.GITLAB_REST_API}/user?access_token=${accessToken}`)

    // console.log('The user data -------------------------------- ', data)

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
    const perPage = 70
    let page = 1
    let events = []

    for (let i = 0; i < 2; i++) {
      const response = await axios.get(`${process.env.GITLAB_REST_API}/events?&per_page=${perPage}&page=${page}&access_token=${accessToken}`)

      events = events.concat(response.data)

      page++
    }

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

    //   const query = `
    //   query {
    //     currentUser {
    //       groups {
    //         nodes {
    //           name
    //           fullPath
    //           avatarUrl
    //           projects {
    //             nodes {
    //               name
    //               fullPath
    //               repository {
    //                 tree {
    //                   lastCommit {
    //                     authorName
    //                     authoredDate
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // `

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
                nameWithNamespace
                lastActivityAt #date of last commit or push event
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

    console.log('GRAPHQL RESPONSE-----------------------------------------------', result.data.currentUser.groups.nodes)

    const groups = result.data.currentUser.groups.nodes
    const projects = []

    groups.forEach(group => {
      console.log('EACH GROUP GRAPHQL RESPONSE ------------------------------------ ')
      console.log('Group name: ', group.name)
      console.log('Group avatarUrl: ', group.avatarUrl)
      console.log('Group path: ', group.fullPath)
      const projects = group.projects.nodes
      projects.forEach(project => {
        console.log('Project repo author: ', project.repository.tree.lastCommit.author)
        const lastCommit = project.repository.tree.lastCommit
        const projectWithCommit = { ...project, lastCommit }
        projects.push(projectWithCommit)
      })
    })

    const data = { groups, projects }

    res.render('user/groups', { data })
  }
}
