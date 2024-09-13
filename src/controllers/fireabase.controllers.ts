import { Request, Response } from "express";
import { deleteUser } from "../services/turfVisualizer.service";

export const deleteUser_TV = async (req: Request, res: Response) => {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).send("UID is required");
  }
  try {
    await deleteUser(uid as string);
    res.status(200).send(`Successfully deleted user: ${uid}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
};
