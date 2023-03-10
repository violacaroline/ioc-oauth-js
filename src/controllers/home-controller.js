import { HomeService } from '../service/home-service.js'

/**
 * Home controller.
 */
export class HomeController {
  #service

  /**
   * The HomeController constructor setting its service.
   *
   * @param {HomeService} service - The service to set.
   */
  constructor (service = new HomeService()) {
    this.#service = service
  }

  /**
   * Renders the landing page and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  index (req, res, next) {
    try {
      res.render('home/index')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Redirects user to Gitlab for authentication.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async redirectToGitlab (req, res, next) {
    try {
      const STATE = this.#service.generateRandomString(20)

      res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APPLICATION_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${STATE}&scope=read_api+read_user+read_repository`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches the access token and redirects user to profile page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getAccessToken (req, res, next) {
    try {
      const code = req.query.code

      req.session.accessToken = await this.#service.getAccessToken(code)

      req.session.flash = { type: 'success', text: 'Authorization Successful!' }

      res.redirect('/user/profile')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the profile and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getProfile (req, res, next) {
    try {
      if (!req.session.accessToken) {
        const error = new Error('Unauthorized')
        error.status = 401
        throw error
      }
      const accessToken = req.session.accessToken

      const data = await this.#service.getProfile(accessToken)

      res.render('user/profile', { data })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the events and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getEvents (req, res, next) {
    try {
      if (!req.session.accessToken) {
        const error = new Error('Unauthorized')
        error.status = 401
        throw error
      }
      const accessToken = req.session.accessToken
      const page = req.query.page || 1

      const events = await this.#service.getEvents(accessToken, page)

      res.render('user/events', { events })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the groups/projects and sends the rendered HTML string as an HTTP response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getGroupsAndProjects (req, res, next) {
    try {
      if (!req.session.accessToken) {
        const error = new Error('Unauthorized')
        error.status = 401
        throw error
      }
      const accessToken = req.session.accessToken

      const groups = await this.#service.getGroups(accessToken)

      res.render('user/groups', { groups })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logs the user out.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  logOut (req, res, next) {
    try {
      if (req.session) {
        req.session.destroy()
        res.redirect('../')
      }
    } catch (error) {
      next(error)
    }
  }
}
