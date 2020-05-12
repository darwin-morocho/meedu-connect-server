import { Router } from 'express';
import * as controller from '../controllers/users-controller';
import { thirdAuth } from '../../middlewares/auth';

const router: Router = Router();

/**
 * @api {post} /api/v1/users/create-token
 * @apiVersion 1.0.0
 * @apiDescription  Creates a new jwt token to allow consume the API and connect to websockets,  expiresIn (is in seconds)
 * @apiName GetToken
 * @apiGroup Users
 *
 * @apiHeader {String} Content-Type=application/json application/json.
 * @apiHeader {String} apikey YOUR API KEY.
 *
 * @apiParam {String} username The username to show in the calls
 * @apiParam {String|number} [userId] The the userId could be an integer or string
 * @apiParam {Object} [extra] Aditional info of the user as a json
 *
 * @apiParamExample {json} Request-Example as application/json:
 *     {
 *       "username": "darwin",
 *        "userId" :"5099803df3f4948bd2f98391",
 *        "extra": {
 *              "key":"value",
 *              "key2":"value2"
 *        }
 *
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
 *      "expiresIn": 300
 * }
 */
router.post('/create-token', thirdAuth, controller.createUserToken);
export default router;
