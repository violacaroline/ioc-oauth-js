import express from 'express'
import createError from 'http-errors'
import { SnippetsController } from '../controllers/snippets-controller.js'
import { User } from '../models/user.js'

export const router = express.Router()

const controller = new SnippetsController()

/**
 * Authorization function for create page.
 *
 * @param {*} req - Express request object.
 * @param {*} res - Express response object.
 * @param {*} next - Next function call.
 * @returns {Error} - An errror page.
 */
const authorizeUserForCreate = async (req, res, next) => {
  const authorized = await User.authorizeForCreate(req, res, next)
  if (authorized) {
    next()
  } else {
    return next(createError(404, 'Not found.'))
  }
}

/**
 * Authorization function for update/delete pages.
 *
 * @param {*} req - Express request object.
 * @param {*} res - Express response object.
 * @param {*} next - Next function call.
 * @returns {Error} - An errror page.
 */
const authorizeUserForUpdateDelete = async (req, res, next) => {
  const authorized = await User.authorizeForUpdateDelete(req, res, next)
  if (authorized) {
    next()
  } else {
    return next(createError(403, 'You are not authorized to access this page.'))
  }
}

// Map HTTP verbs and route paths to controller action methods.

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/register', (req, res, next) => controller.register(req, res, next))
router.post('/register', (req, res, next) => controller.registerPost(req, res, next))

router.get('/login', (req, res, next) => controller.login(req, res, next))
router.post('/login', (req, res, next) => controller.loginPost(req, res, next))

router.get('/logout', (req, res, next) => controller.logout(req, res, next))

router.get('/create', authorizeUserForCreate, (req, res, next) => controller.create(req, res, next))
router.post('/create', authorizeUserForCreate, (req, res, next) => controller.createPost(req, res, next))

router.get('/:id/update', authorizeUserForUpdateDelete, (req, res, next) => controller.update(req, res, next))
router.post('/:id/update', authorizeUserForUpdateDelete, (req, res, next) => controller.updatePost(req, res, next))

router.get('/:id/delete', authorizeUserForUpdateDelete, (req, res, next) => controller.delete(req, res, next))
router.post('/:id/delete', authorizeUserForUpdateDelete, (req, res, next) => controller.deletePost(req, res, next))
