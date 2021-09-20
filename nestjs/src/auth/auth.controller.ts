import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Req,
	Res,
	UseGuards,
  } from '@nestjs/common';
  
  
import { Request, Response } from 'express';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
  
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard as FortyTwoGuard } from './guard/42.guard';
  
@Controller('auth')
export class AuthController {
	constructor(
	  private authService: AuthService,
	  private userService: UserService,
	) {}
	
	/**
	 * This route allows you to authenticate to a user account without using OAuth
	 * but simply by providing the id of the account you want to be connected to.
	 * ! @debug this route is only available in a development and test context
	 * @param res object corresponding to the server responce.
	 * @returns Promise<User>
	 */
	@Get('login/:id')
	@UseGuards(FortyTwoGuard)
	async loginDebug(@Res({ passthrough : true }) res: Response, @Param('id', ParseIntPipe) id: number): Promise<User> {
		if (process.env.ENVIRONMENT != "DEV")
			throw new NotFoundException("");
		let user: User;
		user = (await this.userService.getOneById(id));
		const { accessToken } = this.authService.login(user);
		res.cookie('jwt', accessToken);
		//   res.send(user); // ! Bad thing to fix later
		return user;
	}
	
	/**
	 * Production login root
	 */
	@Get('login')
	@UseGuards(FortyTwoGuard)
	async login() {
		// Redirect to authentication pipeline
	}
	
	/**
	 * 42 OAuth Callback get responce code and creating jwt token.
	 * @param req Request object corresponding to the client request.
	 * @param res Responce object corresponding to the server responce.
	 * @returns Promise<User> return user.
	 */
	@Get('42/callback')
	@UseGuards(FortyTwoGuard)
	async fortyTwoCallback(@Req() req: Request, @Res({ passthrough : true }) res: Response): Promise<User> {
		const { accessToken } = this.authService.login(req.user); // get jwt token
		res.cookie('jwt', accessToken); // Creating cookies (jwt token)
		res.location("http://localhost:3000/"); // redirect to front
		// res.send(req.user); // ! Bad thing to fix later
		return req.user;
	}
}
