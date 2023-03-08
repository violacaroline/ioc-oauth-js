import axios from 'axios'

/**
 * blmljge
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
}
