import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import {
  convertDataToImage,
  deleteImage,
  getFilePath,
} from "../helpers/file.helper";
import fs from "fs";
import {
  getDocument,
  saveFileFromFirebase,
  uploadFileToFirebase,
} from "../services/firebase.service";
import { firebaseProcess } from "../services/turfVisualizer.service";
import { fb_tufVisualizerInstance } from "../configs/fb.turfVisualizer.config";
import { ProcessTimer } from "../helpers/process.helper";
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
export const turf_visualizer_handler = async (req: Request, res: Response) => {
  try {
    const taskTracker = new ProcessTimer();
    console.log("processing turf visualizer");
    // const [image] = [req.file];
    // if (!image) {
    //   console.log("Invalid data , image is required");
    //   return res.status(400).send("Invalid data , image is required");
    // }
    // let filepath = {
    //   filename: image.filename,
    //   filepath: image.path,
    // };

    await saveFileFromFirebase(
      req.body.file,
      "turf-visualizer/",
      fb_tufVisualizerInstance
    );
    const filepath = await getFilePath(req.body.file);
    // if (image?.size > 1 * 1024 * 1024) {
    //   taskTracker.start();
    //   filepath = await compressImage(image.filename);
    //   taskTracker.stop();
    //   console.log(`1.1-Compressing file took : ${taskTracker.getTime()}`);
    // }

    taskTracker.start();
    const data = fs.readFileSync(filepath);
    let attempts = 0;
    const maxAttempts = 24;
    let response;
    while (attempts < maxAttempts) {
      response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/maskformer-swin-base-coco",
        {
          headers: {
            Authorization: "Bearer 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",
          },
          method: "POST",
          body: data,
        }
      );
      if (response.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } else {
        break;
      }
    }
    if (!response) {
      return res.status(500).json({
        message: "Failed to fetch image",
      });
    }
    const result = await response.json();
    console.log(result);
    taskTracker.stop();
    console.log(`2-Generating mask/json :${taskTracker.getTime()}`);
    taskTracker.start();
    const maskName = await convertDataToImage(result);
    taskTracker.stop();
    console.log(`3-Creating mask from json :${taskTracker.getTime()}`);
    taskTracker.start();
    const maskUrl = await uploadFileToFirebase(maskName, "data");
    const imageUrl = await uploadFileToFirebase(req.body.file, "data");
    taskTracker.stop();
    console.log(`4-Upload image to firebase :${taskTracker.getTime()}`);
    taskTracker.start();
    const prompts = await getDocument(
      "prompts",
      "FHR3HO03svsLcrpHCfWv",
      fb_tufVisualizerInstance
    );
    taskTracker.stop();
    console.log(
      `5-Getting image properties from firebase :${taskTracker.getTime()}`
    );
    taskTracker.start();
    let randomNumber = Math.round(Math.random());
    const output_1: any = await replicate.run(
      "fofr/realvisxl-v3:33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
      {
        input: {
          mask: maskUrl,
          seed:
            (randomNumber === 0 ? prompts.seed_1 : prompts._seed_2) || 34078,
          image: imageUrl,
          width: 1024,
          height: 1024,
          prompt: prompts.prompt || "Dark green turf",
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt:
            prompts.negative_prompt ||
            " , worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch",
          prompt_strength: 0.8,
          num_inference_steps: 20, // 20
        },
      }
    );
    taskTracker.stop();
    console.log(output_1[0]);
    console.log(`6-Generating images :${taskTracker.getTime()}`);
    deleteImage(req.body.file);
    deleteImage(maskName);
    firebaseProcess(output_1[0], req.body.userId);
    return res.status(200).json({ url: [output_1[0]] });
  } catch (error: any) {
    console.log(error.message);
    // console.trace(error);
    return res.status(500).json({ message: error.message });
  }
};
export const generateImageSegmentation = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("processing segmentation request");
    await saveFileFromFirebase(req.body.image, "ai-interior-design/");
    console.log("file fetched");
    const filepath = await getFilePath(req.body.image);
    const data = fs.readFileSync(filepath);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/maskformer-swin-base-coco",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: data,
      }
    );
    deleteImage(req.body.image);
    const result = await response.json();
    console.log(result);
    return res.status(200).json({
      result,
    });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
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

export const promptToImage = async (req: Request, res: Response) => {
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

  console.log(output);
  return res.status(200).json(output);
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
