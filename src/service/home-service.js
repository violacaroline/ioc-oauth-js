import axios from 'axios'

/**
 * The service class.
 */
export class HomeService {
  /**
   * Get the user events.
   *
   * @param {*} accessToken - The accessToken to authenticate user.
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
