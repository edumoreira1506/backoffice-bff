import { NextFunction, Request, Response } from 'express'
import multer from 'multer'

export const withFileSupportFactory = (fields: string[] = []) => (req: Request, res: Response, next: NextFunction) => {
  const uploader = multer()

  return uploader.fields([
    { name: 'files' },
    ...fields.map((field) => ({ name: field }))
  ])(req, res, next)
}
