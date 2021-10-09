import { NextFunction, Request, Response } from 'express'
import multer from 'multer'

export default function withFileSupport(req: Request, res: Response, next: NextFunction) {
  const uploader = multer()

  return uploader.fields([
    { name: 'files' }
  ])(req, res, next)
}
