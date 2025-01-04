import { errMSG } from '../constants/message.js';

export class ApiError extends Error {
  statuscode: number;

  constructor(
    statuscode: number,
    message = errMSG.defaultErrorMsg
  ) {
    super(message);
    this.statuscode = statuscode;
    this.message = message;
  }
}