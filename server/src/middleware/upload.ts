import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'
import path from 'path'
import { mkdirSync, existsSync } from 'fs'
import { DATA_DIR } from '../db'

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function diskStorage(subdir: string): multer.StorageEngine {
  return multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      const dir = path.join(DATA_DIR, subdir)
      ensureDir(dir)
      cb(null, dir)
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
    },
  })
}

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'))
  }
}

const pdfFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'))
  }
}

export const coverUpload = multer({
  storage: diskStorage('covers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

export const attachmentUpload = multer({
  storage: diskStorage('attachments'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: pdfFilter,
})

export const avatarUpload = multer({
  storage: diskStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})
