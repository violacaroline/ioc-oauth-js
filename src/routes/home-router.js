import express from 'express'

export const router = express.Router()

/**
 * Resolves a HomeController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a HomeController object.
 */
const resolveHomeController = (req) => req.app.get('container').resolve('HomeController')

router.get('/', (req, res, next) => resolveHomeController(req).index(req, res, next))

router.get('/auth/gitlab', (req, res, next) => resolveHomeController(req).redirectToGitlab(req, res, next))

router.get('/auth/gitlab/callback', (req, res, next) => resolveHomeController(req).getAccessToken(req, res, next))

router.get('/user/profile', (req, res, next) => resolveHomeController(req).getProfile(req, res, next))

router.get('/user/events', (req, res, next) => resolveHomeController(req).getEvents(req, res, next))

router.get('/user/groups', (req, res, next) => resolveHomeController(req).getGroupsAndProjects(req, res, next))

router.get('/user/logout', (req, res, next) => resolveHomeController(req).logOut(req, res, next))
