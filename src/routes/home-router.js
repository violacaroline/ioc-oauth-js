import express from 'express'

export const router = express.Router()

/**
 * Resolves a HomeController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a HomeController object.
 */
const resolveHomeController = (req) => req.app.get('container').resolve('HomeController')

// GET - Landing page.
router.get('/', (req, res, next) => resolveHomeController(req).index(req, res, next))

// GET - Redirect user to Gitlab for authentication.
router.get('/auth/gitlab', (req, res, next) => resolveHomeController(req).redirectToGitlab(req, res, next))

// GET - Recieve the code in the callback from Gitlab and retrieve access token.
router.get('/auth/gitlab/callback', (req, res, next) => resolveHomeController(req).getAccessToken(req, res, next))

// GET - User profile page.
router.get('/user/profile', (req, res, next) => resolveHomeController(req).getProfile(req, res, next))

// GET - User events page.
router.get('/user/events', (req, res, next) => resolveHomeController(req).getEvents(req, res, next))

// GET - User groups page.
router.get('/user/groups', (req, res, next) => resolveHomeController(req).getGroupsAndProjects(req, res, next))

// GET - Log out user and redirect to landing page.
router.get('/user/logout', (req, res, next) => resolveHomeController(req).logOut(req, res, next))
