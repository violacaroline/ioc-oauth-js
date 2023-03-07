import express from 'express'
import { HomeController } from '../controllers/home-controller.js'

export const router = express.Router()

const controller = new HomeController()

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/auth/gitlab', (req, res, next) => controller.redirectToGitlab(req, res, next))

router.get('/auth/gitlab/callback', (req, res, next) => controller.successAuthorization(req, res, next))

router.get('/user/profile', (req, res, next) => controller.getProfile(req, res, next))

router.get('/user/events', (req, res, next) => controller.getEvents(req, res, next))

router.get('/user/groups', (req, res, next) => controller.getGroupsAndProjects(req, res, next))
