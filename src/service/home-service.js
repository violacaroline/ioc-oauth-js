import axios from 'axios'

/**
 * The service class.
 */
export class HomeService {
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
   */
  async getEvents (accessToken) {
    const perPage = 70
    let page = 1
    let events = []

    for (let i = 0; i < 2; i++) {
      const response = await axios.get(`${process.env.GITLAB_REST_API}/events?&per_page=${perPage}&page=${page}&access_token=${accessToken}`)

      events = events.concat(response.data)

      page++
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
