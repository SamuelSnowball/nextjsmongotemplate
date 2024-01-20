import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const { readFile } = require("node:fs/promises");
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new S3Client({
  region: "eu-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
  },
});

const BUCKET = "traveljournal";

/**
 * Gets the images in the bucket with a markerId as a prefix
 * 
 * @param {*} markerId 
 * @returns 
 *    traveljournal/markerId/image1
 *    traveljournal/markerId/image2
 *    traveljournal/markerId/image3
 */
export async function getImages(markerId) {
  console.log('getImages called with markerId: ' + markerId);

  const input = {
    Bucket: BUCKET,
    //Delimiter: "STRING_VALUE",
    //EncodingType: "url",
    Prefix: markerId,
  };
  const command = new ListObjectsV2Command(input);
  const response = await client.send(command);
  console.log('getImages response: ', response);

  return response?.Contents ?? [];
}

/**
 * 
 * @param {*} req of type FormData, has a file key and the value is the file data.
 * @param {*} res 
 * @returns 
 */
export async function postImages(req, res) {
  let status = 200,
    resultBody = { message: "Files were uploaded successfully" };

  const { markerId } = req.query;

  console.log('postImages recieved a markerId: ', markerId);

  /* Get files from the request using formidable */
  const files = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    const files = [];
    form.on("file", function (field, file) {
      files.push(file);
    });
    form.on("end", () => resolve(files));
    form.on("error", (err) => reject(err));
    form.parse(req, () => {
      //
    });
  }).catch((e) => {
    console.log(e);
    status = 500;
    resultBody = {
      message: "Upload error",
    };
  });

  if (files?.length) {
    try {
      const contents = await readFile(files[0].filepath);
      const key = uuidv4();

      const folderResponse = await createFolderIfNotExist(BUCKET, markerId + "/");  // The / is important as that will create a folder rather than a file
      console.log('createFolderIfNotExist status: ', folderResponse.$metadata.httpStatusCode);

      const putCommand = new PutObjectCommand({
        Bucket: "traveljournal",
        Key: markerId + "/"  + key,
        Body: contents,
        ContentType: "image/png",
      });

      const response = await client.send(putCommand);

      console.log('response status: ', response.$metadata.httpStatusCode);
      res.status(response.$metadata.httpStatusCode);
    } catch (err) {
      console.error(err, err.stack);
    }
  }
}

async function createFolder(Bucket, Key) {
  const command = new PutObjectCommand({ Bucket, Key });
  return client.send(command);
}

async function existsFolder(Bucket, Key) {
  const command = new HeadObjectCommand({ Bucket, Key });

  try {
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    } else {
      throw error;
    }
  }
}

async function createFolderIfNotExist(Bucket, Key) {
  if (!(await existsFolder(Bucket, Key))) {
    return createFolder(Bucket, Key);
  }
}

async function deleteFolder(Bucket, Key) {
  const client = new S3Client();
  const command = new DeleteObjectCommand({ Bucket, Key });
  return client.send(command);
}