import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import { cleanPublicFolder } from "../helpers/clean.helper";
import fs from "fs/promises";
import * as fsSync from "fs"; 
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
import axios from "axios";

export const lucataco_sdxl_handler = async (req: Request, res: Response) => {
  try {
    console.log("processing");
    const [prompt, image] = [req.body.prompt, req.body.image];
    const output = await replicate.run(
      "lucataco/sdxl:c86579ac5193bf45422f1c8b92742135aa859b1850a8e4c531bff222fc75273d",
      {
        input: {
          prompt,
          image,
        },
      }
    );
    console.log(output);
    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const generateImageVariation = async (req: Request, res: Response) => {
  try {
    console.log(req.body.mask);
    console.log(req.body.image);
    console.log(req.body.prompt);
    const input = {
      mask: req.body.mask,
      image: req.body.image,
      prompt: req.body.prompt,
      num_inference_steps: 25,
    };

    const output: any = await replicate.run(
      "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
      { input }
    );
    console.log(output);
    console.log(output[0]);
    return res.status(200).json({
      url: output[0],
    });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const ai_packager_handler = async (req: Request, res: Response) => {
  console.log("start processing");
  try {
    const output = await replicate.run(
      "lucataco/sdxl-controlnet-depth:5e0a5cda895aa23a1aaa1a9a265220097102448e1b4c42b22a3c6d87c12d41a9",
      {
        input: {
          image:
            "https://firebasestorage.googleapis.com/v0/b/file-server-f5b74.appspot.com/o/ai-packager%2FIMG_0985.jpeg?alt=media&token=aab142fe-8f54-413f-86cb-3b16b6d24e7a",
          prompt: req.body.prompt,
          condition_scale: 0.5,
          num_inference_steps: 30,
        },
      }
    );
    console.log(output);
    // return response
    return res.status(200).json(output);
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const profileGeneratorHandler = async (req: Request, res: Response) => {
  try {
    console.log(req.body.image);

    const output: any = await replicate.run(
      "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
      {
        input: {
          prompt: req.body.prompt,
          num_steps: 50,
          style_name: "Photographic (Default)",
          input_image: req.body.image,
          num_outputs: 1,
          guidance_scale: 5,
          negative_prompt:
            "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
          style_strength_ratio: 30,
        },
      }
    );
    return res.status(200).json(output);
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const productVisualiserHandler = async (req: Request, res: Response) => {
  try {
    console.log(req.body.mask);
    console.log(req.body.image);
    console.log(req.body.prompt);
    const input = {
      mask: req.body.mask,
      image: req.body.image,
      prompt: req.body.prompt,
      num_inference_steps: 25,
    };
    const output: any = await replicate.run(
      "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
      { input }
    );
    console.log(output);
    console.log(output[0]);
    return res.status(200).json({
      url: output[0],
    });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const ai_adonisHandler = async (req: Request, res: Response) => {
  console.log("start processing");
  console.log(req.body);

  try {
    const data: any = {
      model: "fast",
      width: 1024,
      height: 1024,
      prompt: req.body.prompt,
      style_image:
        "https://firebasestorage.googleapis.com/v0/b/file-server-f5b74.appspot.com/o/ai-adonis%2FIMG_1162.jpeg?alt=media&token=88fcc065-e887-4264-a535-916390b38e3b",
      output_format: "png",
      output_quality: 80,
      negative_prompt: "",
      number_of_images: 1,
      structure_depth_strength: 1,
      structure_denoising_strength:
        req.body.structure_denoising_strength || 0.65,
    };
    if (req.body.image) {
      data.structure_image = req.body.image;
    }
    const output = await replicate.run(
      "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0",
      {
        input: data,
      }
    );
    console.log(output);
    console.log(output);
    // return response
    return res.status(200).json(output);
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Ensure this directory exists and is writable
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

export const promptToImage = async (req: Request, res: Response) => {
  try {
    // Clean the public folder at the start, keeping important files
    cleanPublicFolder('../../public/uploads', ['Logo-Luxxio-wit.png']); 
    console.log(req.body);
    const [prompt, width, height, numOutputs, numInferenceSteps] = [
      req.body.prompt,
      req.body.width,
      req.body.height,
      req.body.num_outputs,
      req.body.num_inference_steps,
    ];

    const output = await replicate.run(
      "bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f",
      {
        input: {
          width: width,
          height: height,
          prompt: prompt,
          scheduler: "K_EULER",
          num_outputs: numOutputs,
          guidance_scale: 0,
          negative_prompt:
            "worst quality, low quality, cropped image, out of frame, cut off, vignette, frame, border, aspect ratio distortion, off-center subject, unbalanced composition",
          num_inference_steps: numInferenceSteps,
        },
      }
    );

    // Type guard to ensure output is an array of strings
    if (!Array.isArray(output) || !output.every(item => typeof item === 'string')) {
      throw new Error('Unexpected output format from Replicate API');
    }
// Download the watermark image
const watermarkBuffer = fsSync.readFileSync(path.join(__dirname,'..','..', 'public', 'uploads', 'Logo-Luxxio-wit.png'));

// Process each generated image
const watermarkedImageUrls = await Promise.all(output.map(async (imageUrl: string) => {
  // Download the generated image
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data);
  // Get dimensions of the main image
  const mainImage = sharp(imageBuffer);
  const { width, height } = await mainImage.metadata();

  // Resize watermark to a proportion of the main image (e.g., 20% of the width)
  const watermarkWidth = Math.round(500 * 0.2);
  const resizedWatermark = await sharp(watermarkBuffer)
    .resize(watermarkWidth, null, { fit: 'inside' })
    .toBuffer();

  // Add watermark and convert to PNG
  const watermarkedImage = await mainImage
    .composite([{
      input: resizedWatermark,
      gravity: 'southeast'
    }])
    .png()
    .toBuffer();

  // Generate a unique filename
  const filename = `${uuidv4()}.png`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Save the image to disk
  await fs.writeFile(filepath, watermarkedImage);

  // Return the full URL to the image
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}));

return res.status(200).json({ watermarkedImages: watermarkedImageUrls });
} catch (error) {
console.error('Error in promptToImage:', error);
return res.status(500).json({ error: 'An error occurred while processing the images' });
}
};

export const clotheChangerAiHandler = async (req: Request, res: Response) => {
  const [modelUrl, productUrl, category] = [
    req.body.modelUrl,
    req.body.productUrl,
    req.body.category,
  ];
  const output = await replicate.run(
    "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
    {
      input: {
        crop: false,
        steps: 30,
        category: category,
        force_dc: false,
        garm_img: productUrl,
        human_img: modelUrl,
        mask_only: false,
        garment_des: "cute pink top",
      },
    }
  );
  console.log(output);
  return res.status(200).json(output);
};
