// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../lib/dbConnect'
import Ticket from '../../models/ticket'

type ResponseType = {
  data?: any // todo
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const tickets = await Ticket.find({})
        res.status(200).json({ success: true, data: tickets })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const ticket = await Ticket.create(
          req.body
        )
        res.status(201).json({ success: true, data: ticket })
      } catch (error) {
        console.log("Failed to post: ", error)
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}