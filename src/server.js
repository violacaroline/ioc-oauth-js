/**
 * The starting point of the application.
 *
 * @author Andrea Viola Caroline Åkesson
 * @version 1.0.0
 */

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import logger from 'morgan'
import session from 'express-session'
import { router } from './routes/router.js'

try {
  // Create express application.
  const app = express()

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())
  // app.use(
  //   helmet.contentSecurityPolicy({
  //     directives: {
  //       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  //       'form-action': ["'self'", 'https://gitlab.lnu.se']
  //     }
  //   })
  // )

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Set up the session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }))

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.use(expressLayouts)
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Parse requests of the content type application/json.
  app.use(express.json())

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // // Flash messages - survives only a round trip.
    // if (req.session.flash) {
    //   res.locals.flash = req.session.flash
    //   delete req.session.flash
    // }

    // Pass the base URL to the views.
    res.locals.baseURL = baseURL
    // console.log(res.locals.baseURL)

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    // 404 Not Found.
    if (err.status === 404) {
      return res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') {
      return res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
    }

    // Only providing detailed error in development.
    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
