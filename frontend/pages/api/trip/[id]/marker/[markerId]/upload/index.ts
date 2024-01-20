// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from "next";
import {
  getImages,
  postImages,
} from "../../../../../../../lib/s3";


type ResponseType = {
  data?: any; // todo
  success: boolean;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

/*
http://localhost:3000/api/trip/3/marker/5/upload

For handling image uploads, it proxies the data to S3, and discards the imageID.
*/
export default async function handler(req, res: NextApiResponse<ResponseType>) {
  const { method } = req;

  const { markerId } = req.query;

  switch (method) {
    case "GET":
      const listResponse = await getImages(markerId);
      res.status(200).json({ data: listResponse });
      break;

    case "POST":
      try {
        // Do I need to return a value from postImages here, to send it back?
        // Or can I return it from postImages...?
        // I'm setting it in the res object, so it should be fine to set it there.
        await postImages(req, res);
        res.send({});
      } catch (err) {
        console.error(
          "Caught error whilst attempting to POST marker/upload with error: ",
          err
        );
      }
      break;

    default:
      res.status(400);
      break;
  }
}