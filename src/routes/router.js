/**
 * The routes.
 */
import express from 'express'
import { router as homeRouter } from './home-router.js'
import { router as snippetRouter } from './snippets-router.js'

export const router = express.Router()

router.use('/', homeRouter)

router.use('/snippets', snippetRouter)

router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
