import express from 'express'
import { HomeController } from '../controllers/home-controller.js'

export const router = express.Router()

const controller = new HomeController()

router.get('/', (req, res, next) => controller.index(req, res, next))

router.post('/auth/gitlab', (req, res, next) => controller.redirectToGitlab(req, res, next))

router.get('/auth/gitlab/callback', (req, res, next) => controller.successAuthorization(req, res, next))

router.post('/authorized/profile', (req, res, next) => controller.profile(req, res, next))
