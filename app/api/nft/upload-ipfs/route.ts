import { NextResponse } from 'next/server';
import axios from "axios";
const { Readable } = require("stream");
const FormData = require('form-data')

const JWT = process.env.JWT_PINATA_CLOUD


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const response = await axios(JSON.parse(body.data).url, { responseType: 'arraybuffer' })
        const buffer64 = Buffer.from(response.data, 'binary');
        const stream = Readable.from(buffer64);
        const data = new FormData();
    data.append('file', stream, {
      filepath: 'nft.jpg'
    })

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
      maxBodyLength: Infinity,
      headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          Authorization: JWT
      }
    });
    
    return NextResponse.json(
        { cid:res.data.IpfsHash },
        {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
        },
      );
  } catch (error:any) {
    return NextResponse.json(
        { error },
        {
          status: 400,
          headers: {
            'content-type': 'text/plain',
          },
        },
      );
  }




  


}