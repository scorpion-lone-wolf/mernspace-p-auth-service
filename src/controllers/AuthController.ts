import { Request, Response } from "express";

export class AuthController {
  private service: string;
  constructor() {
    this.service = "Auth Service";
    // binding (as this will be undefined inside the normal method)
    // this.register = this.register.bind(this);
  }
  register(req: Request, res: Response) {
    res.status(201).json({
      status: "success"
    });
  }
}
