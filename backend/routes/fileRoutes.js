import express from 'express'
const router = express.Router()
import {
    main
} from '../controllers/fileController.js'

router.route('/').get(main)

export default router