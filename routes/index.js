const express = require('express');
const router = express.Router();
const superadminRouter = require('./superadmin');
const authRouter = require('./auth');
const userRouter = require('./user');

router.use('/superadmin', superadminRouter);
router.use('/auth', authRouter);
router.use('/user', userRouter);

module.exports = router;
