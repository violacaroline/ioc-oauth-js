/**
 * Module for bootstrapping.
 *
 * @author Andrea Viola Caroline Åkesson
 * @version 1.0.0
 */

import { IoCContainer } from '../util/IoCContainer.js'
import { HomeService } from '../service/home-service.js'
import { HomeController } from '../controllers/home-controller.js'

const iocContainer = new IoCContainer()

iocContainer.register('HomeServiceSingleton', HomeService, {
  singleton: true
})

iocContainer.register('HomeController', HomeController, {
  dependencies: [
    'HomeServiceSingleton'
  ]
})

export const container = Object.freeze(iocContainer)
