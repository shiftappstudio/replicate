import { model } from "../configs/gemini.config";

export const getLanguage = async (prompt: any, maxRetries: number = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(
        `detect the language of this text :"${prompt}" , it is not English , translate it in English , if it's , just give the sentence back . 
         Answer as :
         {
           "detectedLanguage" : "the prompt language, use full language name ex : Chinese , French , ..."
           "result" : "the translated sentence"
         }
        `
      );
      const response = result.response;
      const text = response.text();
      const parsedResult = JSON.parse(text);
      return parsedResult;
    } catch (error) {
      retries++;
      console.log("attempt : " + retries);

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error("Max retries exceeded. Unable to get language.");
};
