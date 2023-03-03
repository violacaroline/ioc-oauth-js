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

  redirectToGitlab(req, res, next) {
    res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APPLICATION_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${process.env.STATE}&scope=read_user+read_api`)
  }

  successAuthorization(req, res, next) {
    res.render('authorized/welcome')
  }

  profile(req, res, next) {
    res.render('authorized/profile')
  }
}
