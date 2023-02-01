import express from 'express'
const router = express.Router()
import {
    main,
    saveToDb,
    getStatus
} from '../controllers/fileController.js'

router.route('/').get(main)
router.route('/save-to-db').post(saveToDb)
router.route('/get-status').get(getStatus)

export default router