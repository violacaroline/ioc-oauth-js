import axios from 'axios'

/**
 * The service class.
 */
export class HomeService {
  /**
   * Generates a string to set the STATE variable to prevent CSRF attacks.
   *
   * @param {number} length - Length of string.
   * @returns {string} - A random string of specified length.
   */
  generateRandomString (length) {
    let randomizedString = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      randomizedString += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return randomizedString
  }

  /**
   * Get the access token for authorization.
   *
   * @param {*} code - The response code used to recieve access token.
   */
  async getAccessToken (code) {
    const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`

    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)

    const accessToken = response.data.access_token

    return accessToken
  }

  /**
   * Get the user profile.
   *
   * @param {*} accessToken - The access token to authorize the user.
   */
  async getProfile (accessToken) {
    const { data } = await axios.get(`${process.env.GITLAB_REST_API}/user?access_token=${accessToken}`)

    return data
  }

  /**
   * Get the user events.
   *
   * @param {*} accessToken - The access token to authorize the user.
   * @param {*} page - The requested page.
   */
  async getEvents (accessToken, page) {
    const perPage = 20

    let events = []

    const response = await axios.get(`${process.env.GITLAB_REST_API}/events?&page=${page}&per_page=${perPage}&access_token=${accessToken}`)

    if (page === '6') {
      events.push(response.data.shift())
    } else {
      events = response.data
    }

    return events
  }

  /**
   * Get the user groups and projects.
   *
   * @param {*} accessToken - The accessToken to authenticate user.
   */
  async getGroups (accessToken) {
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

    return groups
  }
}
