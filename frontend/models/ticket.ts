import mongoose from 'mongoose'

/* TicketSchema will correspond to a collection in your MongoDB database. */
const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this ticket.'],
    maxlength: [20, 'Title cannot be moasre than 20 characters'],
  },
})

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema)