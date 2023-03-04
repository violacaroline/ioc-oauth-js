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
    res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APPLICATION_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${process.env.STATE}&scope=read_api`)
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

    // console.log('------- THE RESPONSE DATA ------')
    // console.log(response.data)

    req.session.refreshToken = response.data.refresh_token
    console.log('REFRESH TOKEN -------------------------------', req.session.refreshToken)
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
    console.log('REFRESH TOKEN -------------------------------', req.session.refreshToken)
    const refreshToken = req.session.refreshToken

    const parameters = `client_id=${process.env.APPLICATION_ID}&client_secret=${process.env.APPLICATION_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token&redirect_uri=${process.env.REDIRECT_URI}`

    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)
    const accessToken = response.data.access_token
    console.log('RESPONSE.DATA.ACCESS_TOKEN------------------------------------------', accessToken)

    const { data } = await axios.get(`https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`)

    console.log(data.name, ' ', data.id)

    res.render('auth/profile')
  }
}
